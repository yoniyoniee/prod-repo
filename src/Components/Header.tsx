import styled from "styled-components";
import {
  motion,
  useAnimation,
  useMotionValueEvent,
  useScroll,
} from "framer-motion";
import { Link, useHistory, useRouteMatch } from "react-router-dom";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
// import { BASE_PATH, IVideo } from "../api";
// import axios from "axios";
import { ErrorMessage } from "@hookform/error-message";

const Nav = styled(motion.nav)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: fixed;
  width: 100%;
  top: 0;
  font-size: 14px;
  padding: 20px 60px;
  color: white;
  z-index: 100;
`;

const Col = styled.div`
  display: flex;
  align-items: center;
`;

const Logo = styled(motion.img)`
  margin-right: 50px;
  width: 95px;
  height: 25px;
  cursor: pointer;
`;

const Items = styled.ul`
  display: flex;
  align-items: center;
`;

const Item = styled.li`
  margin-right: 20px;
  color: ${(props) => props.theme.white.darker};
  transition: color 0.3s ease-in-out;
  position: relative;
  display: flex;
  justify-content: center;
  flex-direction: column;
  &:hover {
    color: ${(props) => props.theme.white.lighter};
  }
`;

const Search = styled.form`
  color: white;
  display: flex;
  align-items: center;
  position: relative;
  svg {
    height: 25px;
  }
  cursor: pointer;
`;

const Circle = styled(motion.span)`
  position: absolute;
  width: 5px;
  height: 5px;
  border-radius: 5px;
  bottom: -5px;
  left: 0;
  right: 0;
  margin: 0 auto;
  background-color: ${(props) => props.theme.red};
`;

const Input = styled(motion.input)`
  transform-origin: right center;
  position: absolute;
  right: 0px;
  padding: 5px 10px;
  padding-left: 40px;
  z-index: -1;
  color: white;
  font-size: 16px;
  background-color: transparent;
  border: 1px solid ${(props) => props.theme.white.lighter};
`;

const logoVariants = {
  animate: {
    opacity: [1, 0, 0.2, 1, 0, 0.2, 1],
    rotate: [0, -5, 10, -8, 0],
    y: [0, -8, 2, 0],
    scale: [1, 0.95, 1.1, 1],
  },
};

const navVariants = {
  top: {
    backgroundColor: "rgba(0,0,0,0)",
  },
  scroll: {
    backgroundColor: "rgba(0,0,0,1)",
  },
};

interface IForm {
  keyword: string;
}

function Header() {
  const [searchOpen, setSearchOpen] = useState(false);
  const homeMatch = useRouteMatch("/");
  const uploadMatch = useRouteMatch("/upload");
  const inputAnimation = useAnimation();
  const navAnimation = useAnimation();
  const { scrollY } = useScroll();
  const toggleSearch = () => {
    if (searchOpen) {
      inputAnimation.start({
        scaleX: 0,
        opacity: 0,
      });
    } else {
      inputAnimation.start({
        scaleX: 1,
        opacity: 1,
      });
    }
    setSearchOpen((prev) => !prev);
  };
  useMotionValueEvent(scrollY, "change", (y) => {
    if (y > 80) {
      navAnimation.start("scroll");
    } else {
      navAnimation.start("top");
    }
  });

  const history = useHistory();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<IForm>();

  const onValid = (data: IForm) => {
    history.push(`/search?keyword=${data.keyword}`);
    setValue("keyword", "");
    window.location.reload();
  };

  const handleVideoEnd = () => {
    history.push("/");
  };

  return (
    <Nav variants={navVariants} animate={navAnimation} initial={"top"}>
      <Col>
        <Logo
          variants={logoVariants}
          whileHover="animate"
          src={require("../Images/jetflix.png")}
          onClick={handleVideoEnd}
        ></Logo>
        <Items>
          <Item>
            <Link to="/">
              Home {homeMatch?.isExact && <Circle layoutId="circle" />}
            </Link>
          </Item>
          <Item>
            <Link to="/upload">
              Upload {uploadMatch && <Circle layoutId="circle" />}
            </Link>
          </Item>
        </Items>
      </Col>
      <Col>
        <Search onSubmit={handleSubmit(onValid)}>
          <motion.svg
            onClick={toggleSearch}
            animate={{ x: searchOpen ? -215 : 0 }}
            transition={{ type: "linear" }}
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            {!searchOpen ? (
              <path
                fillRule="evenodd"
                d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                clipRule="evenodd"
              ></path>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512">
                <path d="M310.6 233.4c12.5 12.5 12.5 32.8 0 45.3l-192 192c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L242.7 256 73.4 86.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l192 192z" />
              </svg>
            )}
          </motion.svg>
          <Input
            {...register("keyword", {
              required: "이 입력란을 작성하세요.",
              minLength: {
                value: 2,
                message: "2글자 이상 입력해주세요.",
              },
              pattern: {
                value: /^[ㄱ-ㅎ가-힣a-zA-Z0-9\s]+$/,
                message: "한글,영어,숫자만 입력하세요.",
              },
            })}
            id="keyword"
            type="text"
            animate={inputAnimation}
            initial={{ scaleX: 0 }}
            transition={{ type: "linear" }}
            placeholder="What is your favorite video?"
          />
          <ErrorMessage
            errors={errors}
            name="keyword"
            render={({ message }) => {
              return (
                <p style={{ position: "fixed", top: 50, right: 100 }}>
                  {searchOpen ? message : ""}
                </p>
              );
            }}
          />
        </Search>
      </Col>
    </Nav>
  );
}

export default Header;
