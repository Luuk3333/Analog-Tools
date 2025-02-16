export const buildNumber = (import.meta.env.VITE_BUILD_GIT_COMMIT_SHA || "unknown").substring(0, 7);
