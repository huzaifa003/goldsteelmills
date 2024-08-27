import React, { useState, useEffect, useRef } from "react";
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
  Tooltip,
  Flex,
  Text,
  useToast,
  Image,
  SimpleGrid,
  Select,
  Heading,
} from "@chakra-ui/react";
import { AddIcon, InfoOutlineIcon } from "@chakra-ui/icons";
import { useReactToPrint } from "react-to-print";
import axios from "axios";
import logo from "../../../public/logo.jpeg";
import { BASE_URL } from "../../utils";
import { useAuthProvider } from "../../hooks/useAuthProvider";

const ViewPurchaseBill = () => {
  const [rows, setRows] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [advancePayment, setAdvancePayment] = useState(0);
  const [previousBalance, setPreviousBalance] = useState(0);
  const [items, setItems] = useState([]);
  const [unloading, setUnloading] = useState(0);

  const [incrementalId, setIncrementalId] = useState(1);
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
        setSuppliers(response.data);
      } catch (error) {
        console.error("Error fetching suppliers:", error);
      }
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

    fetchSuppliers();
    fetchItems();
  }, [token]);

  const handleSupplierChange = async (event) => {
    const supplier_id = event.target.value;
    setSelectedSupplier(supplier_id);
    
    try {
      const response = await axios.get(`${BASE_URL}purchases/supplier/${supplier_id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const supplierData = response.data;
      setAdvancePayment(supplierData.advance || 0);
      setPreviousBalance(supplierData.balance || 0);

      const purchaseRows = supplierData.map((bill, index) => ({
        id: index + 1,
        items: bill.bills.map((item, itemIndex) => ({
          id: itemIndex + 1,
          billNumber: item.bill_no,
          gatePassNumber: item.gatePassNo,
          vehicleNumber: item.vehicle_no,
          itemType: item.itemType,
          quantity: item.weight,
          kaat: item.kaat,
          price: item.rate,
        })),
      }));

      setRows(purchaseRows);
      setUnloading(supplierData.unloading || 0);
    } catch (error) {
      console.error("Error fetching purchase details:", error);
      toast({
        title: "Failed to fetch purchase details.",
        description: error.response?.data?.message || "Something went wrong.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const calculateBill = () => {
    let total = 0;
    rows.forEach((row) => {
      row.items.forEach((item) => {
        const quantity = parseFloat(item.quantity) || 0;
        const price = parseFloat(item.price) || 0;
        total += (quantity - item.kaat) * price;
      });
    });
    total -= advancePayment;
    total -= unloading;
    const subtotal = total + previousBalance;

    return { total: total.toFixed(2), subtotal: subtotal.toFixed(2) };
  };

  const { total, subtotal } = calculateBill();

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    pageStyle: `
      @page {
        size: A4 landscape;
        margin: 1mm;
      }
      @media print {
        body {
          font-size: 12pt;
          color: black;
        }
        .print-full-width {
          min-width: fit-content;
          width: auto;
        }
        .print-table th, .print-table td {
          padding: 8px;
          font-size: 10pt;
          border: 1px solid black;
        }
        .print-table th {
          background-color: #4A5568;
          color: white;
        }
      }
    `
  });

  return (
    <Box
      bg="#f4f4f4"
      w={"100%"}
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
        className="print-full-width"
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
        <SimpleGrid columns={[1, 2]} spacing={5} mb={8} className="print-full-width">
          <FormControl>
            <FormLabel>Suppliers / Customers</FormLabel>
            <Select
              placeholder="Select supplier"
              onChange={handleSupplierChange}
            >
              {suppliers.map((supplier) => (
                <option key={supplier._id} value={supplier._id}>
                  {supplier.firstName + " " + supplier.lastName}
                </option>
              ))}
            </Select>
          </FormControl>
        </SimpleGrid>
        <Table variant="simple" colorScheme="teal" mb={8} className="print-table">
          <Thead bg="teal.600">
            <Tr>
              <Th color="white">#</Th>
              <Th color="white">Bill Number</Th>
              <Th color="white">Gate Pass Number</Th>
              <Th color="white">Vehicle Number</Th>
              <Th color="white">Item Type</Th>
              <Th color="white">Weight/Quantity</Th>
              <Th color="white">Kaat</Th>
              <Th color="white">Rate/Price</Th>
              <Th color="white">Total</Th>
            </Tr>
          </Thead>
          <Tbody>
            {rows.map((row, rowIndex) => (
              <React.Fragment key={row.id}>
                {row.items?.map((item, itemIndex) => (
                  <Tr key={item.id}>
                    <Td>{rowIndex + 1 + "." + (itemIndex + 1)}</Td>
                    <Td>
                      <Tooltip label="Bill Number">
                        <Input
                          type="text"
                          placeholder="Bill Number"
                          value={item.billNumber || ""}
                          readOnly
                          className="print-full-width"
                        />
                      </Tooltip>
                    </Td>
                    <Td>
                      <Tooltip label="Gate Pass Number">
                        <Input
                          type="text"
                          placeholder="Gate Pass Number"
                          value={item.gatePassNumber || ""}
                          readOnly
                          className="print-full-width"
                        />
                      </Tooltip>
                    </Td>
                    <Td>
                      <Tooltip label="Vehicle Number">
                        <Input
                          type="text"
                          placeholder="Vehicle Number"
                          value={item.vehicleNumber || ""}
                          readOnly
                          className="print-full-width"
                        />
                      </Tooltip>
                    </Td>
                    <Td>
                      <Tooltip label="Item Type">
                        <Select
                          value={item.itemType || ""}
                          readOnly
                          className="print-full-width"
                        >
                          {items.map((itemOption) => (
                            <option key={itemOption._id} value={itemOption._id}>
                              {itemOption.name}
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
                          value={item.quantity || ""}
                          readOnly
                          className="print-full-width"
                        />
                      </Tooltip>
                    </Td>
                    <Td>
                      <Tooltip label="Kaat">
                        <Input
                          type="number"
                          placeholder="Kaat"
                          value={item.kaat || ""}
                          readOnly
                          className="print-full-width"
                        />
                      </Tooltip>
                    </Td>
                    <Td>
                      <Tooltip label="Price">
                        <Input
                          type="number"
                          placeholder="Price"
                          value={item.price || ""}
                          readOnly
                          className="print-full-width"
                        />
                      </Tooltip>
                    </Td>
                    <Td>{((item.quantity - (item.kaat ||  0)) * (item.price || 0)).toFixed(2)}</Td>
                  </Tr>
                ))}
              </React.Fragment>
            ))}
          </Tbody>
        </Table>
        <SimpleGrid columns={[1, 3]} spacing={5} mt={8} mb={8} className="print-full-width">
          <FormControl>
            <FormLabel>Advance Payment</FormLabel>
            <Input
              type="number"
              value={advancePayment}
              readOnly
              className="print-full-width"
            />
          </FormControl>
          <FormControl>
            <FormLabel>Previous Balance</FormLabel>
            <Input
              type="number"
              value={previousBalance}
              readOnly
              className="print-full-width"
            />
          </FormControl>
          <FormControl>
            <FormLabel>Unloading</FormLabel>
            <Input
              type="number"
              value={unloading}
              readOnly
              className="print-full-width"
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
      </Box>
    </Box>
  );
};

export default ViewPurchaseBill;
