'use client';

import { useState, useEffect, useRef } from "react";
import { firestore } from "@/firebase";
import { Box, Typography, Modal, Stack, TextField, Button } from "@mui/material";
import { collection, getDocs, setDoc, deleteDoc, getDoc, doc } from "firebase/firestore";

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
};

export default function Home() {
  const [inventory, setInventory] = useState([]);
  const [open, setOpen] = useState(false);
  const [itemName, setItemName] = useState('');
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const querySnapshot = await getDocs(collection(firestore, 'inventory'));
        const items = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setInventory(items);
      } catch (error) {
        console.error("Error fetching inventory: ", error);
      }
    };

    fetchInventory();
  }, []);

  const addItem = async (name) => {
    try {
      if (name.trim() === "") return;

      const itemRef = doc(firestore, 'inventory', name);
      const itemSnap = await getDoc(itemRef);

      if (itemSnap.exists()) {
        const { quantity } = itemSnap.data();
        await setDoc(itemRef, { quantity: quantity + 1 });
      } else {
        await setDoc(itemRef, { quantity: 1 });
      }

      setInventory((prevInventory) =>
        prevInventory.map(item => item.id === name ? { ...item, quantity: item.quantity + 1 } : item)
      );
    } catch (error) {
      console.error("Error adding item: ", error);
    }
  };

  const removeItem = async (name) => {
    try {
      const itemRef = doc(firestore, 'inventory', name);
      const itemSnap = await getDoc(itemRef);

      if (itemSnap.exists()) {
        const { quantity } = itemSnap.data();
        if (quantity > 1) {
          await setDoc(itemRef, { quantity: quantity - 1 });
          setInventory((prevInventory) =>
            prevInventory.map(item => item.id === name ? { ...item, quantity: item.quantity - 1 } : item)
          );
        } else {
          await deleteDoc(itemRef);
          setInventory((prevInventory) => prevInventory.filter(item => item.id !== name));
        }
      }
    } catch (error) {
      console.error("Error removing item: ", error);
    }
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleCameraToggle = () => {
    if (isCameraOpen) {
      handleCameraClose();
    } else {
      handleCameraOpen();
    }
  };

  const handleCameraOpen = () => {
    setIsCameraOpen(true);
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then((stream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play();
          }
        })
        .catch((error) => {
          console.error("Error accessing camera: ", error);
        });
    } else {
      console.error("Camera not supported in this browser.");
    }
  };

  const handleCameraClose = () => {
    setIsCameraOpen(false);
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      const tracks = stream.getTracks();

      tracks.forEach(track => {
        track.stop();
      });

      videoRef.current.srcObject = null;
    }
  };

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      gap={4}
    >
      <Typography variant="h2">Pantry Management</Typography>

      <Button variant="contained" onClick={handleOpen}>
        Add New Item
      </Button>
      <Button variant="contained" color="primary" onClick={handleCameraToggle}>
        {isCameraOpen ? 'Close Camera' : 'Open Camera'}
      </Button>

      {isCameraOpen && (
        <Box>
          <video ref={videoRef} width="300" height="200" autoPlay></video>
        </Box>
      )}

      <Modal open={open} onClose={handleClose}>
        <Box sx={modalStyle}>
          <Typography variant="h6">Add Item</Typography>
          <Stack direction="row" spacing={2}>
            <TextField
              label="Item Name"
              variant="outlined"
              fullWidth
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
            />
            <Button
              variant="contained"
              onClick={() => {
                addItem(itemName);
                setItemName('');
                handleClose();
              }}
            >
              Add
            </Button>
          </Stack>
        </Box>
      </Modal>

      <Box width="80%" maxHeight="50vh" overflow="auto" border="1px solid #ccc">
        {inventory.map(({ id, quantity }) => (
          <Box
            key={id}
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            padding={2}
            borderBottom="1px solid #eee"
          >
            <Typography variant="h6">{id}</Typography>
            <Typography variant="h6">Quantity: {quantity}</Typography>
            <Stack direction="row" spacing={2}>
              <Button variant="contained" color="primary" onClick={() => addItem(id)}>
                Add
              </Button>
              <Button variant="contained" color="secondary" onClick={() => removeItem(id)}>
                Remove
              </Button>
            </Stack>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
