import React from 'react';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';

import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles({
  container: {
    height: '100vh',
    backgroundSize: `cover`,
    background: `linear-gradient(
            rgba(0, 0, 0, 0.5),
            rgba(0, 0, 0, 0.5)
        ),
        url(https://images.unsplash.com/photo-1564585530977-a99e9ff883fe?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1225&q=80)`,
  },
});

export default function Unsupported() {
  const classes = useStyles();

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="space-evenly"
      className={classes.container}
    >
      <Typography variant="h3">
        <Box fontFamily="Monospace" m={3}>
          Mobile platforms are currently unsupported :(
        </Box>
        <Box fontFamily="Monospace" m={3}>
          Please visit Youtube Parties on a computer
        </Box>
      </Typography>
    </Box>
  );
}
