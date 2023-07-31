import React, { useState } from "react";
import styled from "styled-components";
import Dropzone from "react-dropzone";
import axios from "axios";
import { motion } from "framer-motion";
import { useQuery } from "react-query";
import { IVideo, getVideos } from "../api";
import { makeBgPath, makePlayBgPath } from "../utils";
import { library } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPaperPlane,
  faVolumeMute,
  faVolumeHigh,
} from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";
import { useHistory } from "react-router-dom";
import { FILE_API_URL as fileApiUrl } from "../api";
import { DB_API_URL as dbApiUrl } from "../api";

const Wrapper = styled.div`
  background-color: black;
`;

const Back = styled.div<{ bgphoto: string }>`
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 60px;
  background-image: linear-gradient(rgba(0, 0, 0, 0), rgba(0, 0, 0, 1)),
    url(${(props) => props.bgphoto});
  background-size: cover;
`;

const Loader = styled.div`
  height: 20vh;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Container = styled(motion.div)`
  position: fixed;
  left: 57%;
  right: 0;
  top: 20px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 50%;
  z-index: 101;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 90vh;
  width: 60%;
  background-color: #f8f8f8;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  width: 80%;
  margin-bottom: 20px;
`;

const InputLabel = styled.label`
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 5px;
`;

const InputField = styled.input`
  height: 40px;
  padding: 5px 10px;
  font-size: 16px;
  border-radius: 5px;
  border: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const UploadBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 18%;
  width: 80%;
  border: 2px dashed #cccccc;
  padding: 20px;
  margin-bottom: 20px;
  cursor: pointer;
`;

const UploadMessage = styled.p`
  font-size: 16px;
  margin-top: 10px;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: center;
  width: 80%;
`;

const SubmitButton = styled.button`
  height: 40px;
  width: 150px;
  margin-right: 10px;
  font-size: 16px;
  font-weight: bold;
  color: #ffffff;
  background-color: #0077cc;
  border: none;
  border-radius: 5px;
  cursor: pointer;
`;

const CancelButton = styled.button`
  height: 40px;
  width: 150px;
  font-size: 16px;
  font-weight: bold;
  color: #0077cc;
  background-color: #ffffff;
  border: 2px solid #0077cc;
  border-radius: 5px;
  cursor: pointer;
`;

const Icone = styled(motion.div)`
  font-size: 60px;
  background-color: #f8f8f8;
  border-radius: 100%;
  width: 90px;
  height: 90px;
  text-align: center;
  padding-top: 5px;
  padding-right: 8px;
  position: fixed;
  right: 0;
  bottom: 0;
  margin-bottom: 90px;
  margin-right: 70px;
  cursor: pointer;
`;

const Video = styled(motion.video)`
  position: fixed;
  right: 0;
  bottom: 100;
  min-width: 100%;
  min-height: 100%;
  width: auto;
  height: auto;
  background-size: cover;
`;

const VolumeGroup = styled(motion.div)`
  position: fixed;
  bottom: 0;
  left: 0;
  padding: 80px;
  font-size: 34px;
  z-index: 100;
  cursor: pointer;
`;

const ToastSubmit = Swal.mixin({
  toast: true,
  position: "center-right",
  width: "600px",
  padding: "10%",
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.addEventListener("mouseenter", Swal.stopTimer);
    toast.addEventListener("mouseleave", Swal.resumeTimer);
  },
});

const ToastEnd = Swal.mixin({
  toast: true,
  position: "center",
  width: "600px",
  padding: "10%",
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.addEventListener("mouseenter", Swal.stopTimer);
    toast.addEventListener("mouseleave", Swal.resumeTimer);
  },
});

library.add(faPaperPlane);
library.add(faVolumeMute);
library.add(faVolumeHigh);

const PaperPlane = () => {
  return <FontAwesomeIcon icon="paper-plane" />;
};

const VolumeOff = () => {
  return <FontAwesomeIcon icon="volume-mute" />;
};

const VolumeOn = () => {
  return <FontAwesomeIcon icon="volume-high" />;
};

type UploadFile = {
  file: File | null;
  isValid: boolean;
};

type FormData = {
  title: string;
  overview: string;
  background: UploadFile;
  poster: UploadFile;
  trailer: UploadFile;
};

function Upload() {
  const history = useHistory();
  const [formData, setFormData] = useState<FormData>({
    title: "",
    overview: "",
    background: { file: null, isValid: false },
    poster: { file: null, isValid: false },
    trailer: { file: null, isValid: false },
  });
  const [isToggled, setToggle] = useState(false);
  const [isMuted, setMute] = useState(true);
  const [isFinish, setFinish] = useState(false);

  const handleIcon = (event: React.MouseEvent<HTMLElement>) => {
    setToggle((prev) => !prev);
  };

  const handleDropBackground = (acceptedFiles: File[]) => {
    const backgroundFile = acceptedFiles[0];
    if (
      backgroundFile.type !== "image/jpeg" &&
      backgroundFile.type !== "image/png"
    ) {
      ToastSubmit.fire({
        icon: "warning",
        title: ".jpg 또는 .png 형식의 배경화면을 선택해주세요.",
      });
      return;
    }
    setFormData((prevState) => ({
      ...prevState,
      background: {
        file: backgroundFile,
        isValid: backgroundFile && backgroundFile.type === "video/mp4",
      },
    }));
  };

  const handleDropPoster = (acceptedFiles: File[]) => {
    const posterFile = acceptedFiles[0];
    if (posterFile.type !== "image/jpeg" && posterFile.type !== "image/png") {
      ToastSubmit.fire({
        icon: "warning",
        title: ".jpg 또는 .png 형식의 포스터를 선택해주세요.",
      });
      return;
    }
    setFormData((prevState) => ({
      ...prevState,
      poster: {
        file: posterFile,
        isValid: posterFile && posterFile.type.startsWith("image/"),
      },
    }));
  };

  const handleDropTrailer = (acceptedFiles: File[]) => {
    const trailerFile = acceptedFiles[0];
    if (trailerFile.type !== "video/mp4") {
      ToastSubmit.fire({
        icon: "warning",
        title: ".mp4 형식의 비디오 영상을 선택해주세요.",
      });
      return;
    }
    setFormData((prevState) => ({
      ...prevState,
      trailer: {
        file: trailerFile,
        isValid: trailerFile && trailerFile.type === "image/jpeg",
      },
    }));
  };

  const convertToBase64 = (file: File) => {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.readAsDataURL(file);
      fileReader.onload = () => {
        resolve(fileReader.result);
      };
      fileReader.onerror = (error) => {
        reject(error);
      };
    });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (
      !formData.background.file ||
      !formData.poster.file ||
      !formData.trailer.file ||
      !formData.title ||
      !formData.overview
    ) {
      ToastSubmit.fire({
        icon: "warning",
        title: "이미지 파일 및 동영상과 설명을 넣어주세요",
      });
      return;
    }

    const data = new FormData();
    data.append("background", formData.background.file!);
    data.append("poster", formData.poster.file!);
    data.append("trailer", formData.trailer.file!);
    data.append("title", formData.title);
    data.append("overview", formData.overview);
    try {
      ToastSubmit.fire({
        icon: "info",
        title: "잠시만 기다려주세요...",
        timer: 10000,
      });
      await axios
        .post(dbApiUrl, {
          title: `${data.get("title")}`,
          overview: `${data.get("overview")}`,
        })
        .then(async (response) => {
          const id = response.data;
          data.forEach(async (value, key) => {
            if ((value as File).type) {
              await axios
                .post(fileApiUrl, {
                  key: `${key}`,
                  type: `${(value as File).type}`,
                  id: `${id}`,
                })
                .then(async (response) => {
                  const presignedUrl = response.data;
                  // console.log(presignedUrl);
                  await axios
                    .put(presignedUrl, value)
                    .then(() => {
                      setTimeout(() => {
                        history.push("/");
                        history.go(0);
                      }, 10000);
                    })
                    // .then((response) => console.log(response))
                    .catch((error) => console.log(error));
                })
                .catch((error) => console.error(error));
            } else {
              // handle title and overview
            }
          });
        })
        .catch((error) => console.error(error));
      // await axios.post("http://192.168.163.20:8080/videos/upload", data, {
      //   headers: {
      //     "Content-Type": "multipart/form-data charset=UTF-8",
      //   },
      // });
      setToggle((prev) => !prev);
      setFormData({
        title: "",
        overview: "",
        background: { file: null, isValid: false },
        poster: { file: null, isValid: false },
        trailer: { file: null, isValid: false },
      });
      // history.push("/");
      // history.go(0);
      // --------------->  이거를 해야대 말아야대? 하면 s3에 제대로 안올라가고 안하면 머였더라?
    } catch (error) {
      console.log(error);
      ToastEnd.fire({
        icon: "error",
        title: "업로드 실패...",
      });
    }
  };

  const handleCancel = () => {
    setFormData({
      title: "",
      overview: "",
      background: { file: null, isValid: false },
      poster: { file: null, isValid: false },
      trailer: { file: null, isValid: false },
    });
    setToggle((prev) => !prev);
  };
  const { data, isLoading } = useQuery<IVideo[]>(
    ["videos", "nowPlaying"],
    getVideos,
    { staleTime: Infinity }
  );

  const handleVolume = () => {
    setMute((prev) => !prev);
  };

  const handleVideoEnd = () => {
    setFinish((prev) => !prev);
  };

  return (
    <Wrapper>
      {isLoading ? (
        <Loader>Loading...</Loader>
      ) : (
        <>
          <Back id="back" bgphoto={makeBgPath(data![0].id)}>
            {!isFinish ? (
              <Video
                autoPlay
                muted={isMuted}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2, duration: 3 }}
                onEnded={handleVideoEnd}
              >
                <source src={makePlayBgPath(data![0].id)} type="video/mp4" />
              </Video>
            ) : null}
            {isToggled ? (
              <Container layoutId="upload" transition={{ duration: 0.33 }}>
                <Form onSubmit={handleSubmit}>
                  <InputGroup>
                    <InputLabel htmlFor="title">Title:</InputLabel>
                    <InputField
                      type="text"
                      name="title"
                      id="title"
                      value={formData.title}
                      onChange={(event) =>
                        setFormData({ ...formData, title: event.target.value })
                      }
                    />
                  </InputGroup>
                  <InputGroup>
                    <InputLabel htmlFor="overview">Overview:</InputLabel>
                    <InputField
                      as="textarea"
                      rows={4}
                      name="overview"
                      id="overview"
                      value={formData.overview}
                      onChange={(event) =>
                        setFormData({
                          ...formData,
                          overview: event.target.value,
                        })
                      }
                    />
                  </InputGroup>
                  <Dropzone onDrop={handleDropBackground}>
                    {({ getRootProps, getInputProps }) => (
                      <UploadBox {...getRootProps()}>
                        <input {...getInputProps()} />
                        {formData.background.file && (
                          <UploadMessage>
                            {formData.background.file.name}
                          </UploadMessage>
                        )}
                        <UploadMessage>
                          Click or Drop to upload Wallpaper
                        </UploadMessage>
                      </UploadBox>
                    )}
                  </Dropzone>
                  <Dropzone onDrop={handleDropPoster}>
                    {({ getRootProps, getInputProps }) => (
                      <UploadBox {...getRootProps()}>
                        <input {...getInputProps()} />
                        {formData.poster.file && (
                          <UploadMessage>
                            {formData.poster.file.name}
                          </UploadMessage>
                        )}
                        <UploadMessage>
                          Click or Drop to upload Poster
                        </UploadMessage>
                      </UploadBox>
                    )}
                  </Dropzone>
                  <Dropzone onDrop={handleDropTrailer}>
                    {({ getRootProps, getInputProps }) => (
                      <UploadBox {...getRootProps()}>
                        <input {...getInputProps()} />
                        {formData.trailer.file && (
                          <UploadMessage>
                            {formData.trailer.file.name}
                          </UploadMessage>
                        )}
                        <UploadMessage>
                          Click or Drop to upload Video
                        </UploadMessage>
                      </UploadBox>
                    )}
                  </Dropzone>
                  <ButtonGroup>
                    <SubmitButton type="submit">Submit</SubmitButton>
                    <CancelButton type="button" onClick={handleCancel}>
                      Cancel
                    </CancelButton>
                  </ButtonGroup>
                </Form>
              </Container>
            ) : null}
            {!isToggled ? (
              <Icone
                layoutId="upload"
                onClick={handleIcon}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5 }}
              >
                <PaperPlane />
              </Icone>
            ) : null}
            <VolumeGroup
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 3, duration: 2.5 }}
              onClick={handleVolume}
            >
              {!isFinish ? isMuted ? <VolumeOff /> : <VolumeOn /> : null}
            </VolumeGroup>
          </Back>
        </>
      )}
    </Wrapper>
  );
}

export default Upload;
