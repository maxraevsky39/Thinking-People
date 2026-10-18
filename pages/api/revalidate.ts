import type { NextApiRequest, NextApiResponse } from "next";

type RevalidateBody = {
  path?: string;
  paths?: string[];
};


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") { res.setHeader("Allow", "POST"); return res.status(405).end(); }
  if (!process.env.REVALIDATE_SECRET || (req.headers.authorization !== `Bearer ${process.env.REVALIDATE_SECRET}` && req.query.secret !== process.env.REVALIDATE_SECRET)) {
    return res.status(401).json({ message: "Invalid secret" });
  }

const body = (req.body ?? {}) as RevalidateBody;

    const requestedPaths = [
    ...(typeof body.path === "string" ? [body.path] : []),
    ...(Array.isArray(body.paths) ? body.paths : []),
  ];

  const paths = Array.from(
    new Set(
      requestedPaths
        .filter((path): path is string => typeof path === "string")
        .map((path) => path.trim())
        .filter((path) => path.startsWith("/") && !path.startsWith("//"))
    )
  );

  if (paths.length === 0) {
    return res.status(400).json({
      message: "Specify path or paths",
    });
  }

  const results = await Promise.allSettled(
    paths.map((path) => res.revalidate(path))
  );

  const revalidated: string[] = [];
  const failed: Array<{
    path: string;
    error: string;
  }> = [];

  results.forEach((result, index) => {
    const path = paths[index];

    if (result.status === "fulfilled") {
      revalidated.push(path);
    } else {
      failed.push({
        path,
        error:
          result.reason instanceof Error
            ? result.reason.message
            : "Unknown error",
      });
    }
  });

  return res.status(failed.length > 0 ? 207 : 200).json({
    success: failed.length === 0,
    revalidated,
    failed,
  });
}