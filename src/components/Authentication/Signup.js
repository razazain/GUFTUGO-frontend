import {
  Button,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  VStack,
  Image,
  Box,
} from "@chakra-ui/react";
import React, { useState } from "react";
import { useToast } from "@chakra-ui/react";
import axios from "axios"
import { useNavigate } from "react-router-dom";






const Signup = () => {
  const [show, setShow] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pic, setPic] = useState("");
  const [localPic, setLocalPic] = useState(null);
  const [picLoading, setPicLoading] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();
  const handleClick = () => setShow(!show);


  const postDetails = (pics) => {
    setLocalPic(pics);
    setPicLoading(true);

    if (!pics) {
      toast({
        title: "No file selected",
        description: "Please upload a valid image.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      setPicLoading(false);
      return;
    }


    if (pics.type === "image/jpeg" || pics.type === "image/png") {
      const data = new FormData();
      data.append("file", pics);
      data.append("upload_preset", "Guftugo-Chatapp");
      data.append("cloud_name", "razazain");

      fetch("https://api.cloudinary.com/v1_1/razazain/image/upload", {
        method: "post",
        body: data,
      })
        .then((res) => res.json())
        .then((data) => {
          setPic(data.url.toString());
          setPicLoading(false);
          toast({
            title: "Image uploaded successfully",
            status: "success",
            duration: 5000,
            isClosable: true,
          });
        })
        .catch((err) => {
          console.error(err);
          toast({
            title: "Image upload failed",
            description: "Please try again.",
            status: "error",
            duration: 5000,
            isClosable: true,
          });
          setPicLoading(false);
        });
    } else {
      toast({
        title: "Invalid file type",
        description: "Please upload a JPEG or PNG image.",
        status: "warning",
        duration: 5000,
        isClosable: true,
      });
      setPicLoading(false);
      return;
    }
  };
  const submitHandler = async () => {
    setPicLoading(true);
    if (!name || !email || !password || !confirmPassword) {
      toast({
        title: "Please Fill all the Fields",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setPicLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Passwords Do Not Match",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setPicLoading(false);
      return;
    }
    try {
      const config = {
        headers: {
          "Content-type": "application/json",
        },
      };
      const { data } = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/api/user`,
        {
          name,
          email,
          password,
          pic,
        },
        config
      );

      toast({
        title: "Registration Successful",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });

      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setPic("");
      setLocalPic(null);


      localStorage.setItem("userInfo", JSON.stringify(data));
      setPicLoading(false);
      navigate("/");


      window.location.reload(); 


    } catch (error) {
      toast({
        title: "Error Occurred!",
        description: error.response.data.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setPicLoading(false);
    }
  };


  return (
    <VStack spacing="5px">
      <FormControl id="first-name" isRequired>
        <FormLabel>Name</FormLabel>
        <Input
          placeholder="Enter Your Name"
          onChange={(e) => setName(e.target.value)}
        />
      </FormControl>

      <FormControl id="email" isRequired>
        <FormLabel>Email</FormLabel>
        <Input
          placeholder="Enter Your Email"
          onChange={(e) => setEmail(e.target.value)}
        />
      </FormControl>

      <FormControl id="password" isRequired>
        <FormLabel>Password</FormLabel>
        <InputGroup size="md">
          <Input
            type={show ? "text" : "password"}
            placeholder="Enter Password"
            onChange={(e) => setPassword(e.target.value)}
          />
          <InputRightElement width="4.5rem">
            <Button h="1.75rem" size="sm" onClick={handleClick}>
              {show ? "Hide" : "Show"}
            </Button>
          </InputRightElement>
        </InputGroup>
      </FormControl>

      <FormControl id="confirm-password" isRequired>
        <FormLabel>Confirm Password</FormLabel>
        <InputGroup size="md">
          <Input
            type={show ? "text" : "password"}
            placeholder="Confirm Password"
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <InputRightElement width="4.5rem">
            <Button h="1.75rem" size="sm" onClick={handleClick}>
              {show ? "Hide" : "Show"}
            </Button>
          </InputRightElement>
        </InputGroup>
      </FormControl>

      <FormControl id="profile-picture">
        <FormLabel>Upload Profile Picture</FormLabel>
        <Input
          type="file"
          accept="image/*"
          onChange={(e) => postDetails(e.target.files[0])}
        />
        {localPic && (
          <Box mt={3}>
            <Image
              src={URL.createObjectURL(localPic)}
              alt="Profile Preview"
              boxSize="100px"
              objectFit="cover"
              borderRadius="full"
            />
          </Box>
        )}
        {pic && !localPic && (
          <Box mt={3}>
            <Image
              src={pic}
              alt="Profile Picture"
              boxSize="100px"
              objectFit="cover"
              borderRadius="full"
            />
          </Box>
        )}
      </FormControl>

      <Button
        colorScheme="teal"
        width="100%"
        mt={4}
        onClick={submitHandler}
        isLoading={picLoading}
      >
        Sign Up
      </Button>
    </VStack>
  );
};

export default Signup;




//https://api.cloudinary.com/v1_1/razazain/image/upload