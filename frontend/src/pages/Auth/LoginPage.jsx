import React, { useState } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Text,
  VStack,
  Heading,
  useToast,
  Flex,
  useColorModeValue,
  Image,
  Divider,
  IconButton,
  InputGroup,
  InputRightElement,
  Spinner,
} from "@chakra-ui/react";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import axios from "axios";
import { useAuthProvider } from "../../hooks/useAuthProvider.js";
import { useNavigate } from "react-router-dom";
import Lottie from "lottie-react";
import animationLogin from "../../../public/animations/loginAnimation.json";
import logo from "../../../public/logo.jpeg";
import { BASE_URL } from "../../utils.js";

export const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // Added loading state
  const { setUser, setToken } = useAuthProvider();
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Show loader when login starts
    try {
      const res = await axios.post(`${BASE_URL}users/login`, {
        email,
        password,
      });
      const { user, token } = res.data;
      setUser(user);
      setToken(token);
      toast({
        title: "Login successful.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      navigate("/admin"); // Navigate to dashboard
    } catch (e) {
      setError(e.response.data.error);
      toast({
        title: "Login failed.",
        description: e.response.data.error,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false); // Hide loader when login or navigation completes
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Flex
      minH="100vh"
      align="center"
      justify="center"
      bg={useColorModeValue("gray.100", "gray.900")}
      p={5}
    >
      <Flex
        bg={useColorModeValue("white", "gray.800")}
        borderRadius="lg"
        boxShadow="lg"
        overflow="hidden"
        w="90%"
        maxW="1200px"
        flexDirection={{ base: "column", md: "row" }}
      >
        <Box
          flex="1"
          display={{ base: "none", md: "flex" }}
          justifyContent="center"
          alignItems="center"
          p={5}
        >
          <Lottie
            animationData={animationLogin}
            style={{ width: "80%", maxWidth: "500px" }}
          />
        </Box>
        <Box
          flex="1"
          p={8}
          bg={useColorModeValue("white", "gray.800")}
          display="flex"
          flexDirection="column"
          justifyContent="center"
        >
          {loading ? ( // Show loader when loading is true
            <Flex justify="center">
              <Spinner size="xl" color="blue.500" />
            </Flex>
          ) : (
            <VStack spacing={5} align="stretch">
              <Flex justifyContent="center">
                <Image src={logo} alt="Logo" w={"110px"} alignSelf="center" />
              </Flex>
              <Heading
                as="h2"
                size="lg"
                textAlign="center"
                color={useColorModeValue("gray.800", "white")}
              >
                Admin Login
              </Heading>
              <Divider />
              <form onSubmit={handleSubmit}>
                <VStack spacing={4}>
                  <FormControl id="email" isRequired>
                    <FormLabel>Email</FormLabel>
                    <Input
                      borderRadius={25}
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      focusBorderColor="blue.500"
                      bg={useColorModeValue("gray.100", "gray.700")}
                      _placeholder={{
                        color: useColorModeValue("gray.500", "gray.300"),
                      }}
                    />
                  </FormControl>
                  <FormControl id="password" isRequired>
                    <FormLabel>Password</FormLabel>
                    <InputGroup>
                      <Input
                        borderRadius={25}
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        focusBorderColor="blue.500"
                        bg={useColorModeValue("gray.100", "gray.700")}
                        _placeholder={{
                          color: useColorModeValue("gray.500", "gray.300"),
                        }}
                      />
                      <InputRightElement>
                        <IconButton
                          aria-label="Toggle Password Visibility"
                          icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                          onClick={togglePasswordVisibility}
                          variant="ghost"
                        />
                      </InputRightElement>
                    </InputGroup>
                  </FormControl>
                  {error && (
                    <Text color="red.500" fontSize="sm">
                      {error}
                    </Text>
                  )}
                  <Button
                    mt={6}
                    borderRadius={25}
                    type="submit"
                    colorScheme="blue"
                    w="70%"
                    bg="blue.500"
                    _hover={{ bg: "blue.600" }}
                    _focus={{ boxShadow: "outline" }}
                  >
                    Login
                  </Button>
                </VStack>
              </form>
            </VStack>
          )}
        </Box>
      </Flex>
    </Flex>
  );
};
