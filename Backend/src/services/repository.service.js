
import axios from "axios";

const GITHUB_API_URL = "https://api.github.com";

const githubClient = axios.create({
  baseURL: GITHUB_API_URL,
  timeout: 10000,
  headers: {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  },
});

const parseRepositoryUrl = (repositoryUrl) => {
  let parsedUrl;

  try {
    parsedUrl = new URL(repositoryUrl);
  } catch {
    throw new Error("Please enter a valid GitHub repository URL.");
  }

  if (
    parsedUrl.hostname !== "github.com" ||
    parsedUrl.protocol !== "https:"
  ) {
    throw new Error("Only public GitHub repository URLs are supported.");
  }

  const segments = parsedUrl.pathname
    .split("/")
    .filter(Boolean);

  if (segments.length !== 2) {
    throw new Error(
      "Enter a repository URL in the format https://github.com/owner/repository"
    );
  }

  const [owner, repository] = segments;

  if (
    !/^[A-Za-z0-9-]+$/.test(owner) ||
    !/^[A-Za-z0-9_.-]+$/.test(repository)
  ) {
    throw new Error("The repository URL contains invalid characters.");
  }

  return { owner, repository };
};

const detectTechnologies = (files, metadata) => {
  const technologies = new Set();

  if (metadata.language) {
    technologies.add(metadata.language);
  }

  const extensions = {
    ".js": "JavaScript",
    ".jsx": "React",
    ".ts": "TypeScript",
    ".tsx": "React + TypeScript",
    ".py": "Python",
    ".java": "Java",
    ".css": "CSS",
    ".html": "HTML",
  };

  for (const file of files) {
    const filename = file.path.split("/").pop();

    for (const [extension, technology] of Object.entries(extensions)) {
      if (filename.endsWith(extension)) {
        technologies.add(technology);
      }
    }

    if (filename === "package.json") {
      technologies.add("Node.js ecosystem");
    }
  }

  return [...technologies];
};


const MAX_SOURCE_FILES = 8;
const MAX_FILE_SIZE = 50 * 1024; // 50 KB per file

const fetchSourceFiles = async (
  owner,
  repository,
  branch,
  files
) => {
  const candidates = files
    .filter((file) => file.size > 0 && file.size <= MAX_FILE_SIZE)
    .filter((file) =>
      /\.(js|jsx|ts|tsx|py|java)$/.test(file.path.toLowerCase())
    )
    .slice(0, MAX_SOURCE_FILES);

  const results = await Promise.allSettled(
    candidates.map(async (file) => {
      const encodedPath = file.path
        .split("/")
        .map(encodeURIComponent)
        .join("/");

      const response = await githubClient.get(
        `/repos/${owner}/${repository}/contents/${encodedPath}`,
        {
          params: { ref: branch },
        }
      );

      const data = response.data;

      if (
        data.type !== "file" ||
        data.encoding !== "base64" ||
        typeof data.content !== "string"
      ) {
        throw new Error("Unsupported file format");
      }

      const content = Buffer.from(data.content, "base64").toString("utf8");

      return {
        path: file.path,
        size: file.size,
        content,
      };
    })
  );

  return results
    .filter((result) => result.status === "fulfilled")
    .map((result) => result.value);
};


export const analyzeRepository = async (repositoryUrl) => {
  const { owner, repository } = parseRepositoryUrl(repositoryUrl);

  try {
    const { data: metadata } = await githubClient.get(
      `/repos/${owner}/${repository}`
    );

    const { data: tree } = await githubClient.get(
      `/repos/${owner}/${repository}/git/trees/${metadata.default_branch}`,
      { params: { recursive: 1 } }
    );

    const allFiles = tree.tree.filter(
      (item) => item.type === "blob"
    );

    
    const eligibleFiles = allFiles.filter((file) => {
      const path = file.path.toLowerCase();

      if (
        path.startsWith("node_modules/") ||
        path.includes("/node_modules/") ||
        path.startsWith("dist/") ||
        path.startsWith("build/") ||
        path.startsWith(".git/")
      ) {
        return false;
      }

      return /\.(js|jsx|ts|tsx|py|java|css|html|json)$/.test(path);
    });

    const selectedFiles = eligibleFiles.slice(0, 50);

    // Fetch the actual source code of selected files
    const sourceFiles = await fetchSourceFiles(
      owner,
      repository,
      metadata.default_branch,
      selectedFiles
    );


    return {
      repository: {
        name: metadata.full_name,
        description: metadata.description,
        url: metadata.html_url,
        defaultBranch: metadata.default_branch,
        stars: metadata.stargazers_count,
        language: metadata.language,
      },      
        analysis: {
        totalFiles: allFiles.length,
        sourceFilesFound: eligibleFiles.length,
        filesSelected: selectedFiles.length,
        technologies: detectTechnologies(selectedFiles, metadata),
        files: selectedFiles.map((file) => ({
            path: file.path,
            size: file.size,
        })),
        sourceFiles,
        truncated: Boolean(tree.truncated),
        }
    };
  } catch (error) {
    if (error.response?.status === 404) {
      throw new Error(
        "Repository not found or not publicly accessible."
      );
    }

    if (error.response?.status === 403) {
      throw new Error(
        "GitHub API rate limit or access restriction reached. Please try again later."
      );
    }

    if (error.response?.status === 429) {
      throw new Error("GitHub rate limit reached. Please try again later.");
    }

    if (error.code === "ECONNABORTED") {
      throw new Error("GitHub took too long to respond. Please try again.");
    }

    throw error;
  }
};


// eligibleFiles — all files that pass your filtering rules.
// selectedFiles — up to 50 eligible files selected for analysis.
// sourceFiles — the actual source code retrieved for up to 8 files.