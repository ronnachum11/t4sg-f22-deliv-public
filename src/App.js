import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import MenuIcon from '@mui/icons-material/Menu';
import MuiAppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import CssBaseline from '@mui/material/CssBaseline';
import Divider from '@mui/material/Divider';
import MuiDrawer from '@mui/material/Drawer';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import Stack from "@mui/material/Stack";
import { createTheme, styled, ThemeProvider } from '@mui/material/styles';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import firebase from 'firebase/compat/app';
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import './App.css';
import EntryTable from './components/EntryTable';
import EntryModal from './components/EntryModal';
import { mainListItems } from './components/listItems';
import { db, SignInScreen } from './utils/firebase';
import { emptyEntry } from './utils/mutations';
// MUI styling constants

const drawerWidth = 240;

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    '& .MuiDrawer-paper': {
      position: 'relative',
      whiteSpace: 'nowrap',
      width: drawerWidth,
      transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
      }),
      boxSizing: 'border-box',
      ...(!open && {
        overflowX: 'hidden',
        transition: theme.transitions.create('width', {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.leavingScreen,
        }),
        width: theme.spacing(7),
        [theme.breakpoints.up('sm')]: {
          width: theme.spacing(9),
        },
      }),
    },
  }),
);

const mdTheme = createTheme();

// App.js is the homepage and handles top-level functions like user auth.

export default function App() {

  // User authentication functionality. Would not recommend changing.

  const [isSignedIn, setIsSignedIn] = useState(false); // Local signed-in state.
  const [currentUser, setcurrentUser] = useState(null); // Local user info

  // Listen to the Firebase Auth state and set the local state.
  useEffect(() => {
    const unregisterAuthObserver = firebase.auth().onAuthStateChanged(user => {
      setIsSignedIn(!!user);
      if (!!user) {
        setcurrentUser(user);
      }
    });
    return () => unregisterAuthObserver(); // Make sure we un-register Firebase observers when the component unmounts.
  }, []);

  // Navbar drawer functionality

  const [open, setOpen] = useState(true);
  const toggleDrawer = () => {
    setOpen(!open);
  };

  // Data fetching from DB. Would not recommend changing.
  // Reference video for snapshot functionality https://www.youtube.com/watch?v=ig91zc-ERSE

  const [entries, setEntries] = useState([]);

  useEffect(() => {

    // ! Database query filters entries for current user. DO NOT CHANGE, editing this query may cause it to fail.
    const q = currentUser?.uid ? query(collection(db, "entries"), where("userid", "==", currentUser.uid)) : collection(db, "entries");

    /* NOTE: onSnapshot allows the page to update automatically whenever there is 
    an update to the database. This means you do not have to manually update
    the page client-side after making an add/update/delete. The page will automatically
    sync with the database! */
    onSnapshot(q, (snapshot) => {
      // Set Entries state variable to the current snapshot
      // For each entry, appends the document ID as an object property along with the existing document data
      setEntries(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })))
    })
  }, [currentUser]);

  // Main content of homescreen. This is displayed conditionally from user auth status

  function mainContent() {
    if (isSignedIn) {
      return (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Stack direction="row" spacing={3}>
              <EntryModal entry={emptyEntry} type="add" user={currentUser} />
            </Stack>
          </Grid>
          <Grid item xs={12}>
            <EntryTable entries={entries} />
          </Grid>
        </Grid>
      )
    } else return (
      <SignInScreen></SignInScreen>
    )
  }

  return (
    <ThemeProvider theme={mdTheme}>
      <Box sx={{ display: 'flex' }}>
        <CssBaseline />
        <AppBar position="absolute" open={open}>
          <Toolbar
            sx={{
              pr: '24px', // keep right padding when drawer closed
            }}
          >
            <IconButton
              edge="start"
              color="inherit"
              aria-label="open drawer"
              onClick={toggleDrawer}
              sx={{
                marginRight: '36px',
                ...(open && { display: 'none' }),
              }}
            >
              <MenuIcon />
            </IconButton>
            <Typography
              component="h1"
              variant="h6"
              color="inherit"
              noWrap
              sx={{ flexGrow: 1 }}
            >
              Links for Climate Good
            </Typography>
            <Typography
              component="h1"
              variant="body1"
              color="inherit"
              noWrap
              sx={{
                marginRight: '20px',
                display: isSignedIn ? 'inline' : 'none'
              }}
            >
              Signed in as {firebase.auth().currentUser?.displayName ? firebase.auth().currentUser?.displayName : "GenericUser"}
            </Typography>
            <Button variant="contained" size="small"
              sx={{
                marginTop: '5px',
                marginBottom: '5px',
                display: isSignedIn ? 'inline' : 'none'
              }}
              onClick={() => firebase.auth().signOut()}
            >
              Log out
            </Button>
          </Toolbar>
        </AppBar>
        <Drawer variant="permanent" open={open}>
          <Toolbar
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              px: [1],
            }}
          >
            <IconButton onClick={toggleDrawer}>
              <ChevronLeftIcon />
            </IconButton>
          </Toolbar>
          <Divider />
          <List component="nav">
            {mainListItems}
          </List>
        </Drawer>
        <Box
          component="main"
          sx={{
            backgroundColor: (theme) =>
              theme.palette.mode === 'light'
                ? theme.palette.grey[100]
                : theme.palette.grey[900],
            flexGrow: 1,
            height: '100vh',
            overflow: 'auto',
          }}
        >
          <Toolbar />
          <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            {mainContent()}
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  );
}