import axios from "axios";

export const FILE_API_URL =
  "https://duvd9ld2ab.execute-api.ap-northeast-2.amazonaws.com/prod/file-upload";
export const DB_API_URL =
  "https://duvd9ld2ab.execute-api.ap-northeast-2.amazonaws.com/prod/db-upload";
export const SUB_URL = "https://d1iyk3lsjkkhxd.cloudfront.net";

const SEARCH_API_URL =
  "https://duvd9ld2ab.execute-api.ap-northeast-2.amazonaws.com/prod/search";
const DEL_API_URL =
  "https://duvd9ld2ab.execute-api.ap-northeast-2.amazonaws.com/prod/delete";
const GET_ALL_URL =
  "https://duvd9ld2ab.execute-api.ap-northeast-2.amazonaws.com/prod/get-all";

export interface IVideo {
  id: number;
  title: string;
  overview: string;
  count: number;
  // bgPath: string;
  // posterPath: string;
  // videoPath: string;
}

export function getVideos(): Promise<IVideo[]> {
  return axios.get(`${GET_ALL_URL}`).then((res) => shuffle(res.data));
}

export async function searchVideos(keyword: string, setVideoList: any) {
  if (keyword)
    /*remove if(keyword), then search "  " => show all videos, For test*/
    return await axios
      .get(`${SEARCH_API_URL}/${keyword.split(" ").join("")}`)
      .then((res) => setVideoList(res.data))
      .catch((error) => console.log(error));
}

export function deleteVideo(id: number) {
  return axios.post(`${DEL_API_URL}/${id}`);
}

function shuffle(array: IVideo[]) {
  // array.sort(() => Math.random() - 0.5);
  return array;
}
