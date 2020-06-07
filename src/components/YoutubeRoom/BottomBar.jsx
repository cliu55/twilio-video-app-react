import React from 'react';
import { AppBar, Toolbar, Box, Typography } from '@material-ui/core';

export default function GIFinput() {
  return (
    <div>
      <Toolbar />
      <AppBar position="relative" color="default">
        <Typography component="div">
          <Box fontFamily="Monospace" lineHeight="normal" display="flex" justifyContent="space-between" m={1.5}>
            <Box>© 2020 YoutubeParties, all rights reserved.</Box>
            <Box>Made by Chris L.</Box>
          </Box>
        </Typography>
      </AppBar>
    </div>
  );
}
