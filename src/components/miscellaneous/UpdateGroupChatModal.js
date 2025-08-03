import { ViewIcon } from '@chakra-ui/icons';
import {
  Box, Button, FormControl, IconButton, Input, Modal, ModalBody, ModalCloseButton, ModalContent,
  ModalFooter, ModalHeader, ModalOverlay, Spinner, useDisclosure,
  useToast
} from '@chakra-ui/react';
import React, { useState } from 'react'
import axios from "axios";
import UserBadgeItem from '../UserAvatar/UserBadgeItem';
import UserListItem from "../UserAvatar/UserListItem";
import { ChatState } from '../../Context/ChatProvider';

const UpdateGroupChatModal = ({ fetchMessages, fetchAgain, setFetchAgain = () => {} }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [groupChatName, setGroupChatName] = useState("");
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [renameloading, setRenameLoading] = useState(false);
  const toast = useToast();

  const { selectedChat, setSelectedChat, user } = ChatState();

  const handleSearch = async (query) => {
    setSearch(query);
    if (!query) return;

    try {
      setLoading(true);
      const config = {
        headers: { Authorization: `Bearer ${user.token}` },
      };
      const { data } = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/user?search=${query}`, config);
      setSearchResult(data);
    } catch (error) {
      toast({
        title: "Error Occurred!",
        description: "Failed to Load the Search Results",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRename = async () => {
    if (!groupChatName.trim()) {
      toast({
        title: "Chat name cannot be empty!",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
      return;
    }

    try {
      setRenameLoading(true);
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.put(
        `${process.env.REACT_APP_API_BASE_URL}/api/chat/rename`,
        { chatId: selectedChat?._id, chatName: groupChatName.trim() },
        config
      );

      setSelectedChat(data);
      setFetchAgain((prev) => !prev);

      toast({
        title: "Chat name updated successfully!",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    } catch (error) {
      toast({
        title: "Failed to rename chat!",
        description: error.response?.data?.message || "Something went wrong",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    } finally {
      setRenameLoading(false);
      setGroupChatName("");
    }
  };

  const handleAddUser = async (user1) => {
    if (selectedChat.users.find((u) => u._id === user1._id)) {
      return toast({
        title: "User Already in group!",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    }

    if (selectedChat.groupAdmin._id !== user._id) {
      return toast({
        title: "Only admins can add someone!",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    }

    try {
      setLoading(true);
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.put(
        `${process.env.REACT_APP_API_BASE_URL}/api/chat/groupadd`,
        { chatId: selectedChat._id, userId: user1._id },
        config
      );

      setSelectedChat(data);
      setFetchAgain((prev) => !prev);
    } catch (error) {
      toast({
        title: "Error Occurred!",
        description: error.response?.data?.message || "Something went wrong",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (user1) => {
    if (selectedChat.groupAdmin._id !== user._id && user1._id !== user._id) {
      return toast({
        title: "Only admins can remove someone!",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    }

    try {
      setLoading(true);
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.put(
        `${process.env.REACT_APP_API_BASE_URL}/api/chat/groupremove`,
        { chatId: selectedChat._id, userId: user1._id },
        config
      );

      user1._id === user._id ? setSelectedChat(null) : setSelectedChat(data);
      setFetchAgain((prev) => !prev);
      fetchMessages();
      fetchMessages();
    } catch (error) {
      toast({
        title: "Error Occurred!",
        description: error.response?.data?.message || "Something went wrong",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <IconButton d={{ base: "flex" }} icon={<ViewIcon />} onClick={onOpen} />

      <Modal onClose={onClose} isOpen={isOpen} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader fontSize="35px" fontFamily="Work sans" textAlign="center">
            {selectedChat?.chatName}
          </ModalHeader>
          <ModalCloseButton />

          <ModalBody display="flex" flexDir="column" alignItems="center">
            <Box w="100%" display="flex" flexWrap="wrap" pb={3}>
              {selectedChat?.users?.map((u) => (
                <UserBadgeItem key={u._id} user={u} admin={selectedChat.groupAdmin} handleFunction={() => handleRemove(u)} />
              ))}
            </Box>

            <FormControl display="flex">
              <Input placeholder="Chat Name" mb={3} value={groupChatName} onChange={(e) => setGroupChatName(e.target.value)} />
              <Button variant="solid" colorScheme="teal" ml={1} isLoading={renameloading} onClick={handleRename}>
                Update
              </Button>
            </FormControl>

            <FormControl>
              <Input placeholder="Add User to group" mb={1} onChange={(e) => handleSearch(e.target.value)} />
            </FormControl>

            {loading ? <Spinner size="lg" /> : searchResult?.map((user) => <UserListItem key={user._id} user={user} handleFunction={() => handleAddUser(user)} />)}
          </ModalBody>

          <ModalFooter>
            <Button onClick={() => handleRemove(user)} colorScheme="red">
              Leave Group
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default UpdateGroupChatModal;
