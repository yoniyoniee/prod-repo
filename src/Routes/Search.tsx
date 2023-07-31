import { library } from "@fortawesome/fontawesome-svg-core";
import {
  faCaretLeft,
  faCaretRight,
  faFaceTired,
  faTrashCan,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { AnimatePresence, motion, useScroll } from "framer-motion";
import { useEffect, useState } from "react";
import { useHistory, useLocation, useRouteMatch } from "react-router-dom";
import styled from "styled-components";
import {
  makeBgPath,
  makePlayPathFHD,
  makePlayPath720p,
  makePlayPath360p,
  makePlayPathAuto,
  makePosterPath,
} from "../utils";
import { IVideo, deleteVideo, searchVideos } from "../api";
import Swal from "sweetalert2";
import { SUB_URL as subURL } from "../api";
import { Player } from "react-tuby";
import "react-tuby/css/main.css";
import ReactHlsPlayer from "react-hls-player";
import { CognitoIdentityClient } from "@aws-sdk/client-cognito-identity";
import { fromCognitoIdentityPool } from "@aws-sdk/credential-provider-cognito-identity";
import { Kinesis, PutRecordCommand } from "@aws-sdk/client-kinesis";
import { pool_id } from "../pool_key";

const Wrapper = styled.div`
  background-color: black;
  padding-bottom: 200px;
  height: 91vh;
`;
const Slider = styled.div`
  position: relative;
  top: 50px;
  margin: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const LeftBtn = styled(motion.button)`
  display: flex;
  background-color: transparent;
  color: white;
  border: none;
  font-size: 18px;
  margin-right: 3px;
  cursor: pointer;
`;
const RightBtn = styled(motion.button)`
  display: flex;
  background-color: transparent;
  color: white;
  border: none;
  font-size: 18px;
  margin-left: 3px;
  cursor: pointer;
`;

library.add(faCaretRight);
library.add(faCaretLeft);
library.add(faFaceTired);
library.add(faTrashCan);

const LeftArrow = () => {
  return <FontAwesomeIcon icon="caret-left" />;
};
const RightArrow = () => {
  return <FontAwesomeIcon icon="caret-right" />;
};
const TiredFace = () => {
  return <FontAwesomeIcon icon="face-tired" />;
};
const TrashCan = () => {
  return <FontAwesomeIcon icon="trash-can" />;
};

const Row = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 13px;
  width: 100%;
`;
const Info = styled(motion.div)`
  padding: 10px;
  background-color: ${(props) => props.theme.black.lighter};
  opacity: 0;
  position: absolute;
  width: 300px;
  bottom: 0;
  h4 {
    text-align: center;
    font-size: 18px;
  }
`;

const Box = styled(motion.div)<{ bgphoto: string }>`
  margin-top: 40px;
  background-color: white;
  /* background-image: url(${(props) => props.bgphoto}); */
  background-image: radial-gradient(transparent, transparent, black),
    url(${(props) => props.bgphoto});
  background-size: cover;
  background-position: center center;
  height: 200px;
  width: 100%;
  font-size: 66px;
  cursor: pointer;
  :hover {
    background-image: url(${(props) => props.bgphoto});
    border-radius: 2%;
  }
  &:first-child {
    transform-origin: center left;
  }
  &:last-child {
    transform-origin: center right;
  }
`;

const SearchBox = styled.div`
  position: absolute;
  top: -40px;
  height: 65px;
  width: 100%;
  background-color: black;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: bold;
`;

const PageControl = styled.div`
  position: fixed;
  background-color: transparent;
  height: 65px;
  width: 100%;
  bottom: 80px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  font-weight: bold;
`;

const ZeroBox = styled.div`
  display: grid;
  grid-template-rows: repeat(2, 1fr);
  background-color: transparent;
  gap: 20px;
  justify-items: center;
  font-size: 40px;
  margin-top: 230px;
`;

const Overlay = styled(motion.div)`
  position: fixed;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  opacity: 0;
  z-index: 101;
`;

const BigMovie = styled(motion.div)`
  position: absolute;
  width: 80vh;
  height: 73vh;
  left: 0;
  right: 0;
  margin: 0 auto;
  background-color: ${(props) => props.theme.black.lighter};
  border-radius: 15px;
  overflow: hidden;
  z-index: 102;
`;

const BigCover = styled.div`
  width: 100%;
  background-size: cover;
  background-position: center center;
  height: 400px;
`;

const BigCloseBtn = styled(motion.button)`
  position: absolute;
  background-color: transparent;
  color: white;
  border: none;
  width: 30px;
  height: 30px;
  font-size: 15px;
  right: 0;
  margin-right: 7px;
  margin-top: 5px;
  font-weight: bold;
  cursor: pointer;
  :hover {
    color: black;
  }
`;

const BigPoster = styled.div`
  position: relative;
  background-size: cover;
  height: 450px;
  width: 300px;
  bottom: 20%;
  right: -20px;
`;

const BigInfoBox = styled.div`
  position: relative;
  bottom: 61%;
  right: -42%;
  width: 55%;
`;

const BigTitle = styled.h3`
  color: ${(props) => props.theme.white.lighter};
  padding: 10px;
  font-size: 46px;
  position: relative;
  top: -80px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const BigOverview = styled.p`
  padding: 20px;
  position: relative;
  color: ${(props) => props.theme.white.lighter};
  top: -80px;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const boxVariants = {
  normal: {
    scale: 1,
  },
  hover: {
    scale: 1.1,
    transition: {
      duration: 0.3,
      type: "tween",
    },
  },
};

const offset = 18;

let key = "";
let maxCount = 5;

function Search() {
  const history = useHistory();
  const { scrollY } = useScroll();
  const bigMovieMatch = useRouteMatch<{ movieId: string }>("/search/:movieId");
  const location = useLocation();
  const keyword = new URLSearchParams(location.search).get("keyword");
  const [index, setIndex] = useState(0);
  const [count, setCount] = useState(0);
  const [isStart, setStart] = useState(true);
  const [isEnd, setEnd] = useState(false);
  const [videoList, setVideoList] = useState<IVideo[]>([]);
  const [isFinish, setFinish] = useState(true);

  if ((count < maxCount && videoList.length == 0) || key != keyword) {
    searchVideos(keyword as string, setVideoList);
    key = keyword as string;
    setCount((perv) => perv + 1);
    if (videoList.length != 0) {
      setCount(0);
    }
  }

  const decreaseIndex = () => {
    if (videoList) {
      if (index === 0) {
        setStart(true);
      } else {
        setEnd(false);
        if (index - 1 === 0) {
          setStart(true);
        }
        setIndex((prev) => prev - 1);
      }
    }
  };

  const onBoxClicked = (movieId: number) => {
    history.push(`/search/${movieId}`);
  };

  var isExecuted = false;
  const onOverlayClick = () => {
    if (!isExecuted) {
      history.go(-1);
    }
    isExecuted = true;
    setFinish(true);
  };
  const handlePlay = (movieId: number) => {
    setFinish(false);
    const encoder = new TextEncoder();
    const uintArrayValue = encoder.encode(JSON.stringify({ id: movieId }));
    const record = {
      StreamName: "my-stream-kinesis",
      Data: uintArrayValue,
      PartitionKey: "1",
    };
    const uploadData = async () => {
      try {
        const data = await client.send(new PutRecordCommand(record));
        console.log(typeof record);
        console.log("Kinesis updated, data: ", data);
      } catch (err) {
        console.log("Error", err);
      }
    };
    uploadData();
  };
  const handleDelete = (id: number) => {
    Swal.fire({
      title: "정말로 삭제 하시겠습니까?",
      text: "다시 되돌릴 수 없습니다. 신중하세요.",
      icon: "warning",

      showCancelButton: true, // cancel버튼 보이기. 기본은 원래 없음
      confirmButtonColor: "#3085d6", // confrim 버튼 색깔 지정
      cancelButtonColor: "#d33", // cancel 버튼 색깔 지정
      confirmButtonText: "승인", // confirm 버튼 텍스트 지정
      cancelButtonText: "취소", // cancel 버튼 텍스트 지정

      reverseButtons: false, // 버튼 순서 거꾸로
    }).then((result) => {
      // 만약 Promise리턴을 받으면,
      if (result.isConfirmed) {
        // 만약 모달창에서 confirm 버튼을 눌렀다면
        deleteVideo(id)
          .then(() => {
            history.push("/");
          })
          .then(() => {
            history.go(0);
          });
        // Swal.fire("삭제가 완료되었습니다.", "", "success");
        // history.push("/");
        // history.go(0);
      }
    });
  };

  const increaseIndex = () => {
    if (videoList) {
      const totalMovies = videoList.length;
      const maxIndex = Math.ceil(totalMovies / offset) - 1;
      if (index === maxIndex) {
        setEnd(true);
      } else {
        setStart(false);
        if (index + 1 === maxIndex) {
          setEnd(true);
        }
        setIndex((prev) => prev + 1);
      }
    }
  };

  const clickedMovie =
    bigMovieMatch?.params.movieId &&
    videoList?.find((movie) => movie.id === +bigMovieMatch.params.movieId);

  //<-------------AWS KINESIS--------------------------------------------------------------->
  const REGION = "ap-northeast-2";
  const client = new Kinesis({
    region: REGION,
    credentials: fromCognitoIdentityPool({
      client: new CognitoIdentityClient({ region: REGION }),
      identityPoolId: pool_id,
    }),
  });
  //<--------------------------------------------------------------------------------------->

  return (
    <>
      <Wrapper>
        <Slider>
          <SearchBox>"{keyword}"으로 검색한 결과입니다.</SearchBox>
          {videoList.length != 0 ? (
            <AnimatePresence>
              <Row>
                {videoList
                  ?.slice(offset * index, offset * index + offset)
                  .map((movie) => (
                    <Box
                      layoutId={movie.id + ""}
                      whileHover="hover"
                      initial="normal"
                      variants={boxVariants}
                      key={movie.id}
                      bgphoto={makeBgPath(movie.id)}
                      onClick={() => onBoxClicked(movie.id)}
                    ></Box>
                  ))}
              </Row>
            </AnimatePresence>
          ) : (
            <ZeroBox>
              <TiredFace />"{keyword}" 검색 결과가 없습니다.
            </ZeroBox>
          )}
          {videoList.length != 0 ? (
            <PageControl>
              <LeftBtn
                style={
                  isStart ? { opacity: 0, cursor: "default" } : { opacity: 1 }
                }
                onClick={decreaseIndex}
              >
                <LeftArrow />
              </LeftBtn>
              {index + 1}
              <RightBtn
                style={
                  (videoList.length <= 18 ? true : isEnd)
                    ? { opacity: 0, cursor: "default" }
                    : { opacity: 1 }
                }
                onClick={increaseIndex}
              >
                <RightArrow />
              </RightBtn>
            </PageControl>
          ) : null}
          <AnimatePresence>
            {bigMovieMatch ? (
              <>
                <Overlay
                  onClick={onOverlayClick}
                  exit={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                />
                {clickedMovie && !isFinish ? (
                  <motion.div
                    style={{
                      position: "absolute",
                      top: scrollY.get() + 200,
                      left: "25%",
                      width: "88vh",
                      zIndex: 105,
                    }}
                    layoutId={bigMovieMatch.params.movieId}
                  >
                    <Player
                      src={[
                        {
                          quality: 1080,
                          url: `${makePlayPathFHD(clickedMovie.id)}`,
                        },
                        {
                          quality: 720,
                          url: `${makePlayPath720p(clickedMovie.id)}`,
                        },
                        {
                          quality: 360,
                          url: `${makePlayPath360p(clickedMovie.id)}`,
                        },
                        {
                          quality: "Auto",
                          url: `${makePlayPathAuto(clickedMovie.id)}`,
                        },
                      ]}
                      subtitles={[
                        {
                          lang: "ko",
                          language: "Korean",
                          url: `${subURL}/${clickedMovie.id}/ko.vtt`,
                        },
                        {
                          lang: "en",
                          language: "English",
                          url: `${subURL}/${clickedMovie.id}/en.vtt`,
                        },
                      ]}
                      // poster="https://d1bug73j39exox.cloudfront.net/45/post.jpeg"
                    >
                      {(ref, props) => (
                        <ReactHlsPlayer playerRef={ref} {...props} />
                      )}
                    </Player>
                  </motion.div>
                ) : null}
                <BigMovie
                  style={{ top: scrollY.get() }}
                  layoutId={bigMovieMatch.params.movieId}
                >
                  {clickedMovie && (
                    <>
                      <BigCloseBtn onClick={onOverlayClick}>X</BigCloseBtn>
                      <BigCover
                        style={{
                          padding: "150px",
                          backgroundImage: `linear-gradient(to top, black, transparent), url(${makeBgPath(
                            clickedMovie.id
                          )})`,
                        }}
                      />
                      <BigPoster
                        style={{
                          padding: "150px",
                          backgroundImage: `linear-gradient(to top, black, transparent), url(${makePosterPath(
                            clickedMovie.id
                          )})`,
                        }}
                      />
                      <BigInfoBox>
                        <BigTitle>
                          {clickedMovie.title}
                          <div
                            style={{
                              marginTop: "35px",
                              display: "flex",
                            }}
                          >
                            <div
                              style={{
                                backgroundColor: "white",
                                color: "black",
                                borderRadius: "5px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                width: "80px",
                                height: "40px",
                                fontSize: "20px",
                                fontWeight: "bold",
                                marginRight: "15px",
                                cursor: "pointer",
                                gap: "5px",
                              }}
                              onClick={() => handlePlay(clickedMovie.id)}
                            >
                              <RightArrow />
                              재생
                            </div>
                            <div
                              style={{
                                borderColor: "white",
                                borderWidth: "2px",
                                borderStyle: "solid",
                                borderRadius: "100%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                width: "40px",
                                height: "40px",
                                fontSize: "20px",
                                cursor: "pointer",
                              }}
                              onClick={() => handleDelete(clickedMovie.id)}
                            >
                              <TrashCan />
                            </div>
                          </div>
                        </BigTitle>
                        <BigOverview>{clickedMovie.overview}</BigOverview>
                      </BigInfoBox>
                    </>
                  )}
                </BigMovie>
              </>
            ) : null}
          </AnimatePresence>
        </Slider>
      </Wrapper>
    </>
  );
}

export default Search;
