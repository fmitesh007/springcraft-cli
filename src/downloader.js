const SPRING_INITIALIZR_URL = 'https://start.spring.io/starter.zip';

export async function downloadProject(options) {
  const {
    buildTool,
    language,
    javaVersion,
    springBootVersion,
    groupId,
    artifactId,
    packageName,
    description,
    packaging,
    dependencies,
  } = options;

  const params = new URLSearchParams({
    type: buildTool,
    language,
    javaVersion,
    bootVersion: springBootVersion,
    groupId,
    artifactId,
    name: artifactId,
    packageName,
    description,
    packaging,
    dependencies: dependencies.join(','),
  });

  const url = `${SPRING_INITIALIZR_URL}?${params.toString()}`;

  const res = await fetch(url);

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Download failed: ${res.status} ${res.statusText} - ${body}`);
  }

  return Buffer.from(await res.arrayBuffer());
}
