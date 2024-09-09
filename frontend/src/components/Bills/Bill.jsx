import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  HStack,
  Divider,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Heading,
  Tooltip,
  Flex,
  Text,
  useToast,
  Image,
  SimpleGrid,
  Select,
  TableContainer
} from "@chakra-ui/react";
import { AddIcon, InfoOutlineIcon } from "@chakra-ui/icons";
import { useReactToPrint } from "react-to-print";
import axios from "axios";
import logo from "../../../public/logo.jpeg";
import { BASE_URL } from "../../utils";
import { useAuthProvider } from "../../hooks/useAuthProvider";

const Bill = () => {
  const [rows, setRows] = useState([{ id: 1 }]);
  const [suppliers, setSuppliers] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [advancePayment, setAdvancePayment] = useState(0);
  const [previousBalance, setPreviousBalance] = useState(0);
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState("");
  const [customerName, setCustomerName] = useState("");
  const componentRef = useRef();
  const toast = useToast();
  const { token } = useAuthProvider();

  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const response = await axios.get(`${BASE_URL}suppliers`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log(response.data);
        setSuppliers(response.data);
        console.log(suppliers);
        
      } catch (error) {
        console.error("Error fetching suppliers:", error);
      }
    }

    fetchSuppliers();
    fetchItems();
  }, []);

  const handleSupplier = (event) => {
    const supplier_id = event.target.value;
    setSelectedSupplier(supplier_id);
    console.log(supplier_id);
    suppliers.find((supplier) => {
      if (supplier._id === supplier_id) {
        // setAdvancePayment(supplier.advance || 0);
        // setPreviousBalance(supplier.balance || 0);
        setAdvancePayment(0);
        setPreviousBalance(0);
        return true;
      }
    })
    
  };

  const fetchItems = async () => {
    try {
      const response = await axios.get(`${BASE_URL}items`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setItems(response.data);
    } catch (error) {
      console.error("Error fetching items:", error);
    }
  };

  const addRow = () => {
    setRows([...rows, { id: rows.length + 1 }]);
  };

  const updateRow = (index, field, value) => {
    const updatedRows = rows.map((row, i) =>
      i === index ? { ...row, [field]: value } : row
    );
    setRows(updatedRows);
  };

  const calculateBill = () => {
    let total = 0;
    rows.forEach((row) => {
      const quantity = parseFloat(row.quantity) || 0;
      const price = parseFloat(row.price) || 0;
      total += quantity * price;
    });
    total -= advancePayment;
    const subtotal = total + previousBalance;

    return { total: total.toFixed(2), subtotal: subtotal.toFixed(2) };
  };

  const { total, subtotal } = calculateBill();

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    pageStyle: () => `@media print { @page { size: A4 landscape; margin: 1mm } }`,

  });

  
  const handleSubmit = async () => {
    const billDataArray = rows.map(row => ({
        supplier: selectedSupplier || "",
        customerName: customerName || "",
        weight: parseFloat(row.quantity || 0),
        itemType: selectedItem, //removed as not accepted by api
        quantity: parseFloat(row.quantity || 0),
        vehicle_no: row.vehicleNumber || "",
        rate: parseFloat(row.price || 0),
        total: parseFloat((row.quantity || 0) * (row.price || 0)).toFixed(2),
        gatePassNo: row.gatePassNumber || "",
        bill_no: row.billNumber || "",
        date: new Date().toISOString().split("T")[0],
    }));

    const salesData = {
        supplier: selectedSupplier, // Make sure this is properly set from a form field
        bills: billDataArray,
        totalAmount: billDataArray.reduce((acc, bill) => acc + parseFloat(bill.total || 0), 0),
    };

    try {
        await axios.post(`${BASE_URL}sales/register`, salesData, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        toast({
            title: "Sales registered successfully.",
            status: "success",
            duration: 2000,
            isClosable: true,
        });

        const daybookPayload = {
          supplierId : selectedSupplier,
          customerName : customerName,
          description : "Sales",
          amount : salesData.totalAmount,
          type : "debit",
          cash_or_bank : "cash",
        }

        // await axios.post(`${BASE_URL}daybook/register`, daybookPayload, {
        //   headers: {
        //     Authorization: `Bearer ${token}`,
        //   },
        // });
        // toast({
        //   title: "Daybook registered successfully.",
        //   status: "success",
        //   duration: 2000,
        //   isClosable: true,
        // }); 

        handlePrint();



    } catch (error) {
        console.error("Error registering sales:", error);
        toast({
            title: "Failed to register sales.",
            description: error.response?.data?.message || "Something went wrong.",
            status: "error",
            duration: 3000,
            isClosable: true,
        });
    }
};


  return (
    <Box
      bg="#f4f4f4"
      minH="100vh"
      width={'100%'}
      display="flex"
      justifyContent="center"
      
    >
      <Box
        ref={componentRef}
        bg="white"
        p={8}
        rounded="lg"
        shadow="lg"
        width="100%"
        
      >
        <HStack justifyContent="space-between" mb={8}>
          <Image src={logo} alt="Factory Logo" boxSize="80px" />
          <VStack align="flex-start">
            <Heading as="h1" size="lg" color="gray.700">
              White Gold Steel Industry
            </Heading>
            <Text color="gray.500">Glotian Mor, Daska</Text>
          </VStack>
        </HStack>
        <SimpleGrid columns={[1, 3]} spacing={5} mb={8}>
          {/* <FormControl>
            <FormLabel>Customer Name</FormLabel>
            <Input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />

          </FormControl> */}
          {/* <FormControl>
            <FormLabel>Date</FormLabel>
            <Input type="date" />
          </FormControl> */}
          <FormControl>
            <FormLabel>Customer</FormLabel>
            <Select
              placeholder="Select Customer"
              onChange={(e) => handleSupplier(e)}
            >
              {suppliers.map((supplier) => (
                <option key={supplier._id} value={supplier._id}>
                  {supplier.firstName}
                </option>
              ))}
            </Select>
          </FormControl>
        </SimpleGrid>
        <TableContainer overflowX="auto">
  <Table variant="simple" colorScheme="teal" mb={8}>
    <Thead bg="teal.600">
      <Tr>
        <Th color="white">#</Th>
        <Th color="white">Bill Number</Th>
        <Th color="white">Gate Pass Number</Th>
        <Th color="white">Vehicle Number</Th>
        <Th color="white">Item Type</Th>
        <Th color="white">Weight/Quantity</Th>
        <Th color="white">Rate/Price</Th>
        <Th color="white">Total</Th>
      </Tr>
    </Thead>
    <Tbody>
      {rows.map((row, index) => (
        <Tr key={row.id}>
          <Td>{row.id}</Td>
          <Td>
            <Tooltip label="Bill Number">
              <Input
                type="text"
                placeholder="Bill Number"
                value={row.billNumber || ""}
                onChange={(e) => updateRow(index, "billNumber", e.target.value)}
                style={{ minWidth: '150px', width: '150px' }}
              />
            </Tooltip>
          </Td>
          <Td>
            <Tooltip label="Gate Pass Number">
              <Input
                type="text"
                placeholder="Gate Pass Number"
                value={row.gatePassNumber || ""}
                onChange={(e) => updateRow(index, "gatePassNumber", e.target.value)}
                style={{ minWidth: '150px', width: '150px' }}
              />
            </Tooltip>
          </Td>
          <Td>
            <Tooltip label="Vehicle Number">
              <Input
                type="text"
                placeholder="Vehicle Number"
                value={row.vehicleNumber || ""}
                onChange={(e) => updateRow(index, "vehicleNumber", e.target.value)}
                style={{ minWidth: '150px', width: '150px' }}
              />
            </Tooltip>
          </Td>
          <Td>
            <Tooltip label="Item Type">
              <Select
                placeholder="Select item"
                onChange={(e) => updateRow(index, "itemType", e.target.value)}
                style={{ minWidth: '150px', width: '150px' }}
              >
                {items.map((itemType) => (
                  <option key={itemType._id} value={itemType._id}>
                    {itemType.name}
                  </option>
                ))}
              </Select>
            </Tooltip>
          </Td>
          <Td>
            <Tooltip label="Quantity">
              <Input
                type="number"
                placeholder="Quantity"
                value={row.quantity || ""}
                onChange={(e) => updateRow(index, "quantity", e.target.value)}
                style={{ minWidth: '150px', width: '150px' }}
              />
            </Tooltip>
          </Td>
          <Td>
            <Tooltip label="Price">
              <Input
                type="number"
                placeholder="Price"
                value={row.price || ""}
                onChange={(e) => updateRow(index, "price", e.target.value)}
                style={{ minWidth: '150px', width: '150px' }}
              />
            </Tooltip>
          </Td>
          <Td>{((row.quantity || 0) * (row.price || 0)).toFixed(2)}</Td>
        </Tr>
      ))}
    </Tbody>
  </Table>
</TableContainer>

        <Button leftIcon={<AddIcon />} colorScheme="teal" onClick={addRow}>
          Add Vehicle
        </Button>
                  {/* ###TODO-OPTIONAL#### */}
        {/* // advance payment and previous balance */}
        <SimpleGrid columns={[1, 2]} spacing={5} mt={8} mb={8}>
          <FormControl>
            <FormLabel>Advance Payment</FormLabel>
            <Input
              type="number"
              value={advancePayment}
              onChange={(e) =>
                setAdvancePayment(parseFloat(e.target.value) || 0)
              }
            />
          </FormControl>
          <FormControl>
            <FormLabel>Previous Balance</FormLabel>
            <Input
              type="number"
              value={previousBalance}
              onChange={(e) =>
                setPreviousBalance(parseFloat(e.target.value) || 0)
              }
            />
          </FormControl>
        </SimpleGrid>
        <Box fontSize="xl" fontWeight="bold" color="teal.700" mb={8}>
          <Flex justifyContent="space-between">
            <Text>Total: {total}</Text>
            <Tooltip label="Subtotal includes previous balance">
              <Flex align="center">
                <Text mr={1}>Subtotal: {subtotal}</Text>
                <InfoOutlineIcon />
              </Flex>
            </Tooltip>
          </Flex>
        </Box>
        <HStack justifyContent="space-between" mt={10}>
          <Box textAlign="center" w="45%">
            <Divider />
            <Text mt={2}>Signature of CEO</Text>
          </Box>
          <Box textAlign="center" w="45%">
            <Divider />
            <Text mt={2}>Receiver</Text>
          </Box>
        </HStack>
        <Button mt={5} colorScheme="teal" onClick={handlePrint}>
          Print/Save
        </Button>
        <Button mt={5} ml={3} colorScheme="teal" onClick={handleSubmit}>
          Register Bill
        </Button>
      </Box>
    </Box>
  );
};

export default Bill;
