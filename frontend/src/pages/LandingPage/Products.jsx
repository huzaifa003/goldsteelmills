import React from "react";
import {
  Box,
  SimpleGrid,
  Image,
  Text,
  Heading,
  useColorModeValue,
} from "@chakra-ui/react";

const products = [
  { name: "Angle", image: "/images/c4.jpg" },
  { name: "T-Iron Bars", image: "/images/c5.jpg" },
  { name: "Patti", image: "/images/c6.jpg" },
  { name: "Steel Bars", image: "/images/c7.jpg" },
  { name: "Steel Billet", image: "/images/c8.jpg" },
  { name: "Steel Rods", image: "/images/c9.jpg" },
];

const OurProducts = () => {
  const boxBgColor = useColorModeValue("white", "gray.700");
  const boxHoverColor = useColorModeValue("rgba(214, 214, 214, 0.8)", "rgba(0, 0, 0, 0.6)");
  const underlineColor = useColorModeValue("#9D152D", "#9D152D");

  return (
    <Box p={8} bg={useColorModeValue("gray.50", "gray.800")}>
      <Heading as="h2" size="xl" mb={4} textAlign="left" ml={4}>
        Our Products
      </Heading>
      <Box w="230px" h="2px" bg={underlineColor} ml={4} mt={1} mb={6} />
      <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={8}>
        {products.map((product, index) => (
          <Box
            key={index}
            position="relative"
            overflow="hidden"
            p={4}
            bg={boxBgColor}
            boxShadow="md"
            rounded="md"
            transition="transform 0.3s ease"
            _hover={{ transform: "scale(1.03)" }}
          >
            <Box
              display="flex"
              alignItems="center"
              justifyContent="center"
              h="200px"
              borderBottom="1px solid"
              borderColor={useColorModeValue("gray.200", "gray.600")}
              mb={4}
            >
              <Image
                src={product.image}
                alt={product.name}
                borderRadius="md"
                maxH="100%"
                maxW="100%"
                objectFit="cover"
              />
            </Box>
            <Text fontSize="lg" fontWeight="bold" textAlign="center" mt={2}>
              {product.name}
            </Text>
          </Box>
        ))}
      </SimpleGrid>
    </Box>
  );
};

export default OurProducts;
