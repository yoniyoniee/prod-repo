import { motion, AnimatePresence, useScroll } from "framer-motion";
import { useEffect, useState } from "react";
import { useQuery } from "react-query";
import { useHistory, useRouteMatch } from "react-router-dom";
import styled from "styled-components";
import { deleteVideo, getVideos } from "../api";
import { IVideo } from "../api";
import {
  makeBgPath,
  makePlayPathFHD,
  makePlayPath720p,
  makePlayPath360p,
  makePlayPathAuto,
  makePosterPath,
} from "../utils";
import { library } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCaretRight,
  faCaretLeft,
  faTrashCan,
} from "@fortawesome/free-solid-svg-icons";
import useWindowDimensions from "../useWidowDimensions";
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
  padding-bottom: 380px;
`;

const Loader = styled.div`
  height: 20vh;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Banner = styled.div<{ bgphoto: string }>`
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 60px;
  background-image: linear-gradient(rgba(0, 0, 0, 0), rgba(0, 0, 0, 1)),
    url(${(props) => props.bgphoto});
  background-size: cover;
`;

const Title = styled.h2`
  font-size: 68px;
  margin-bottom: 20px;
`;

const Overview = styled.p`
  font-size: 30px;
  width: 50%;
`;

const Slider = styled.div`
  position: relative;
  top: -100px;
`;

const Row = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  position: absolute;
  width: 100%;
`;

const Info = styled(motion.div)`
  padding: 10px;
  background-color: ${(props) => props.theme.black.lighter};
  opacity: 0;
  position: absolute;
  width: 100%;
  bottom: 0;
  h4 {
    text-align: center;
    font-size: 18px;
  }
`;

const Box = styled(motion.div)<{ bgphoto: string }>`
  background-color: white;
  background-image: url(${(props) => props.bgphoto});
  background-size: cover;
  background-position: center center;
  height: 450px;
  width: 300px;
  font-size: 66px;
  cursor: pointer;
  &:first-child {
    transform-origin: center left;
  }
  &:last-child {
    transform-origin: center right;
  }
`;

const BigMovie = styled(motion.div)`
  position: absolute;
  width: 100vh;
  height: 100vh;
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
  height: 100px;
`;

const BigCloseBtn = styled.button`
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
  z-index: 103;
  cursor: pointer;
  :hover {
    color: black;
  }
`;

const BigPoster = styled(motion.div)`
  position: relative;
  background-size: cover;
  height: 2%;
  width: 2%;
  top: 0;
  left: 53%;
`;

const BigInfoBox = styled.div`
  position: relative;
  bottom: 48%;
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
  padding: 10px;
  position: relative;
  color: ${(props) => props.theme.white.lighter};
  top: -80px;
  overflow: hidden;
  text-overflow: ellipsis;
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

const LeftBtn = styled(motion.button)`
  position: absolute;
  width: 50px;
  height: 450px;
  z-index: 100;
  font-size: 30px;
  background-color: rgba(0, 0, 0, 0.8);
  border: none;
  border-top-right-radius: 10px;
  border-bottom-right-radius: 10px;
  color: #ffffff9e;
  cursor: pointer;
  margin-left: -30px;
`;
const RightBtn = styled(motion.button)`
  position: absolute;
  margin-top: -100px;
  width: 50px;
  height: 450px;
  right: 0;
  z-index: 100;
  font-size: 30px;
  background-color: rgba(0, 0, 0, 0.8);
  border: none;
  border-top-left-radius: 10px;
  border-bottom-left-radius: 10px;
  color: #ffffff9e;
  cursor: pointer;
  margin-right: -30px;
`;

library.add(faCaretRight);
library.add(faCaretLeft);
library.add(faTrashCan);

const LeftArrow = () => {
  return <FontAwesomeIcon icon="caret-left" />;
};
const RightArrow = () => {
  return <FontAwesomeIcon icon="caret-right" />;
};

const TrashCan = () => {
  return <FontAwesomeIcon icon="trash-can" />;
};

const boxVariants = {
  normal: {
    scale: 1,
  },
  hover: {
    scale: 1.3,
    y: -50,
    transition: {
      delay: 0.5,
      duration: 0.3,
      type: "tween",
    },
  },
};

const infoVariants = {
  hover: {
    opacity: 1,
    transition: {
      delay: 0.5,
      duration: 0.3,
      type: "tween",
    },
  },
};

const offset = 6;

function Home() {
  const history = useHistory();
  const bigMovieMatch = useRouteMatch<{ movieId: string }>("/movies/:movieId");
  const { scrollY } = useScroll();
  const { data, isLoading } = useQuery<IVideo[]>(
    ["videos", "nowPlaying"],
    getVideos,
    { staleTime: Infinity }
  );
  const [index, setIndex] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const [back, setBack] = useState(false);
  const [isFinish, setFinish] = useState(true);

  const width = useWindowDimensions();

  const rowVariants = {
    hidden: (back: boolean) => ({ x: back ? width + 5 : -width - 5 }),
    visible: { x: 0 },
    exit: (back: boolean) => ({ x: back ? -width - 5 : width + 5 }),
  };

  const increaseIndex = () => {
    if (data) {
      if (leaving) return;
      setBack(true);
      toggleLeaving();
      const totalMovies = data.length - 1;
      const maxIndex = Math.ceil(totalMovies / offset) - 1;
      setIndex((prev) => (prev === maxIndex ? 0 : prev + 1));
    }
  };
  const decreaseIndex = () => {
    if (data) {
      if (leaving) return;
      setBack(false);
      toggleLeaving();
      const totalMovies = data.length - 1;
      const maxIndex = Math.ceil(totalMovies / offset) - 1;
      setIndex((prev) => (prev === 0 ? maxIndex : prev - 1));
    }
  };
  const toggleLeaving = () => {
    setLeaving((prev) => !prev);
  };
  const onBoxClicked = (movieId: number) => {
    history.push(`/movies/${movieId}`);
  };
  const onOverlayClick = () => {
    history.push("/");
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
  const clickedMovie =
    bigMovieMatch?.params.movieId &&
    data?.find((movie) => movie.id === +bigMovieMatch.params.movieId);
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
    <Wrapper>
      {isLoading ? (
        <Loader>로딩중...</Loader>
      ) : (
        <>
          <Banner bgphoto={makeBgPath(data![0].id)}>
            <Title>{data![0].title}</Title>
            <Overview>{data![0].overview}</Overview>
          </Banner>
          <Slider>
            <LeftBtn
              whileTap={{ scale: 0.9 }}
              whileHover={{ translateX: "20px" }}
              onClick={decreaseIndex}
            >
              <LeftArrow />
            </LeftBtn>
            <AnimatePresence
              initial={false}
              onExitComplete={toggleLeaving}
              custom={back}
            >
              <Row
                variants={rowVariants}
                custom={back}
                animate="visible"
                initial="hidden"
                exit="exit"
                transition={{ type: "tween", duration: 1 }}
                key={index}
              >
                {data!
                  .slice(1)
                  .slice(offset * index, offset * index + offset)
                  .map((movie) => (
                    <Box
                      layoutId={movie.id + ""}
                      key={movie.id}
                      whileHover="hover"
                      initial="normal"
                      variants={boxVariants}
                      onClick={() => onBoxClicked(movie.id)}
                      transition={{ type: "tween" }}
                      bgphoto={makePosterPath(movie.id)}
                    >
                      <Info variants={infoVariants}>
                        <h4>{movie.title}</h4>
                      </Info>
                    </Box>
                  ))}
              </Row>
            </AnimatePresence>
          </Slider>
          <RightBtn
            whileTap={{ scale: 0.9 }}
            whileHover={{ translateX: "-20px" }}
            onClick={increaseIndex}
          >
            <RightArrow />
          </RightBtn>
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
                      // poster="https://d1bug73j39exox.cloudfront.net/14/bg.jpeg"
                    >
                      {(ref, props) => (
                        <ReactHlsPlayer playerRef={ref} {...props} />
                      )}
                    </Player>
                  </motion.div>
                ) : null}
                <BigMovie
                  style={{ top: scrollY.get() + 130 }}
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
                              // onClick={handlePlay(clickedMovie.id)}
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
        </>
      )}
    </Wrapper>
  );
}
export default Home;
