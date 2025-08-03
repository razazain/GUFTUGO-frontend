import { Avatar, Box, Button, Drawer, DrawerBody, DrawerContent, DrawerHeader, DrawerOverlay, IconButton, Input, Menu, MenuButton, MenuDivider, MenuItem, MenuList, Spinner, Stack, Text, Tooltip, useDisclosure, useToast } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react'
import { ChevronDownIcon } from "@chakra-ui/icons";
import { ChatState } from '../../Context/ChatProvider';
import ProfileModal from './ProfileModal';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ChatLoading from '../ChatLoading';
import UserListItem from '../UserAvatar/UserListItem';
import { getSender } from '../../config/ChatLogics';



const SideDrawer = () => {

  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState("");
  const [loadingChat, setloadingChat] = useState("");
  const { setSelectedChat,
    user,
    notification,
    setNotification,
    chats,
    setChats, } = ChatState();
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();


  const logoutHandler = () => {
    localStorage.removeItem("userInfo");
    navigate("/");
  }

  const handleSearch = async () => {
    if (!search) {
      toast({
        title: "Please Enter something in search",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top-left",
      });
      return;
    }
    try {
      setLoading(true);

      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/user?search=${search}`, config);

      setLoading(false);
      setSearchResult(data);
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: "Failed to Load the Search Results",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });

    };
  };

  const accessChat = async (userId) => {

    try {
      setloadingChat(true);
      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/chat`, { userId }, config);

      if (!chats.find((c) => c._id === data._id)) setChats([data, ...chats]);
      setSelectedChat(data);
      setloadingChat(false);
      onClose();
    } catch (error) {
      toast({
        title: "Error fetching the chat",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }



  }


  useEffect(() => {
    if (notification.length > 0) {
      const latestNotif = notification[notification.length - 1]; // Get latest notification

      toast({
        title: "New Message Received",
        description: latestNotif.chat.isGroupChat
          ? `New message in ${latestNotif.chat.chatName}`
          : `New message from ${getSender(user, latestNotif.chat.users)}`,
        status: "info",
        duration: 5000,
        isClosable: true,
        position: "top-right",
      });
    }
  }, [notification,toast, user]);

  return (

    <>

      <Box
        bg="white"
        w="100%"
        p="5px 10px"
        borderWidth="5px"
      >
        <Stack
          direction={{ base: "column", md: "row" }}
          align="center"
          justify="space-between"
          spacing={{ base: 3, md: 0 }}
        >

          <Tooltip label="Search User To Chat" hasArrow placement="bottom-end">
            <Button variant="ghost" onClick={onOpen} display="flex" alignItems="center">
              <i className="fa fa-search" aria-hidden="true"></i>
              <Text display={{ md: "flex" }} px="4"> {/* base: "none", */}
                Search User
              </Text>
            </Button>
          </Tooltip>


          <Text fontSize="2xl" fontFamily="Work sans" whiteSpace="nowrap" textAlign="center">
            GUFTUGO - گفتگو
          </Text>
          <Stack direction="row" align="center" spacing={3}>

            <Menu>
              <MenuButton as={IconButton} icon={<i className="fa fa-bell" />} variant="ghost" />
              <MenuList pl={2}>
                {!notification.length && "No New Messages"}
                {notification.map((notif) => (
                  <MenuItem
                    key={notif._id}
                    onClick={() => {
                      setSelectedChat(notif.chat);
                      setNotification(notification.filter((n) => n !== notif));
                    }}
                  >
                    {notif.chat.isGroupChat
                      ? `New Message in ${notif.chat.chatName}`
                      : `New Message from ${getSender(user, notif.chat.users)}`}
                  </MenuItem>
                ))}
              </MenuList>
            </Menu>

            <Menu>
              <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
                <Avatar size="sm" cursor="pointer" name={user.name} src={user.pic} />
              </MenuButton>
              <MenuList>
                <ProfileModal>
                  <MenuItem>My Profile</MenuItem>
                </ProfileModal>
                <MenuDivider />
                <MenuItem onClick={logoutHandler}>Logout</MenuItem>
              </MenuList>
            </Menu>
          </Stack>
        </Stack>
      </Box>

      <Drawer placement="left" onClose={onClose} isOpen={isOpen}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader borderBottomWidth="1px">Search Users</DrawerHeader>
          <DrawerBody>
            <Box display="flex" pb={2}>
              <Input
                placeholder="Search by name or email"
                mr={2}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Button
                onClick={handleSearch}
              >Go</Button>
            </Box>
            {loading ?
              <ChatLoading /> : (
                searchResult?.map((user) => (
                  <UserListItem
                    key={user._id}
                    user={user}
                    handleFunction={() => accessChat(user._id)}
                  />
                ))
              )}
            {loadingChat && <Spinner ml="auto" d="flex" />}
          </DrawerBody>
        </DrawerContent>
      </Drawer>





    </>



  )
}

export default SideDrawer;