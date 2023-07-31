const IMAGE_PATH = "https://d1bug73j39exox.cloudfront.net";
const VIDEO_PATH = "https://d2igobqzh8tss5.cloudfront.net";

export function makeBgPath(id: number) {
  return `${IMAGE_PATH}/${id}/bg.jpeg`;
}

export function makePosterPath(id: number) {
  return `${IMAGE_PATH}/${id}/post.jpeg`;
}

export function makePlayBgPath(id: number) {
  return `${IMAGE_PATH}/${id}/pv.mp4`;
}

export function makePlayPathFHD(id: number) {
  return `${VIDEO_PATH}/${id}/pv1920x1080p_8.5Mbps.m3u8`;
}

export function makePlayPath720p(id: number) {
  return `${VIDEO_PATH}/${id}/pv1280x720p_6.0Mbps.m3u8`;
}

export function makePlayPath360p(id: number) {
  return `${VIDEO_PATH}/${id}/pv640x360p_1.5Mbps.m3u8`;
}

export function makePlayPathAuto(id: number) {
  return `${VIDEO_PATH}/${id}/pv.m3u8`;
}
