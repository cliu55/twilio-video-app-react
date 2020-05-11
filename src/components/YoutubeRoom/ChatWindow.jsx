import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';

import Box from '@material-ui/core/Box';
import TextField from '@material-ui/core/TextField';
import Fab from '@material-ui/core/Fab';
import SendIcon from '@material-ui/icons/Send';
import Divider from '@material-ui/core/Divider';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Typography from '@material-ui/core/Typography';

import { useAppState } from '../../state';
import { useYoutubeRoomState } from './YoutubeRoomStateProvider';

const ChatPanel = styled.div`
  position: relative;
  display: inline-flex;
  flex-direction: column;
  justify-content: flex-end;
  height: 100%;
  width: 100%;
  box-sizing: border-box;
  z-index: 1;
`;

const NoDots = styled.div`
  hr {
    visibility: hidden;
  }
`;

const InputPanel = styled.div`
  display: flex;
  align-items: center;
  padding: 20px;
  align-self: center;
  border-top: 1px solid #fafafa;
`;

const Scrollable = styled.div`
  max-height: 65vh;
  overflow: auto;
`;

export default function ChatWindow() {
  // TODO: user for changing names?
  const {
    roomId: { current: roomId },
  } = useAppState();
  const { client } = useYoutubeRoomState();
  let panel = useRef(null);

  const [chatHistory, setChatHistory] = useState([]);
  const [messageFieldValue, setMessageFieldValue] = useState('');

  useEffect(() => {
    client.registerHandler('message', onMessageReceived);
  }, [client]);

  useEffect(() => {
    scrollChatToBottom();
  }, [chatHistory]);

  const onMessageReceived = entry => {
    setChatHistory(prev => prev.concat(entry));
  };

  const onSendMessage = () => {
    if (messageFieldValue === '') return;
    client.message(roomId, messageFieldValue);
    setMessageFieldValue('');
  };

  const scrollChatToBottom = () => {
    panel.current.scrollTop = panel.current.scrollHeight;
  };

  return (
    <Box width="30%" m={1}>
      <ChatPanel>
        <Scrollable ref={panel}>
          <List>
            {chatHistory.map(({ user, message, event }, i) => {
              return [
                <NoDots>
                  <ListItem key={i} style={{ color: '#fafafa' }}>
                    <ListItemText
                      primary={`${user.name} ${event || ''}`}
                      secondary={
                        <React.Fragment>
                          <Typography component="span" variant="body2" color="textPrimary">
                            {message}
                          </Typography>
                        </React.Fragment>
                      }
                    />
                  </ListItem>
                </NoDots>,
                <Divider inset="true" />,
              ];
            })}
          </List>
        </Scrollable>
        <InputPanel>
          <TextField
            textareastyle={{ color: '#fafafa' }}
            hintstyle={{ color: '#fafafa' }}
            floatinglabelstyle={{ color: '#fafafa' }}
            hinttext="Enter a message."
            floatinglabeltext="Enter a message."
            multiline
            rows={4}
            rowsMax={4}
            onChange={e => setMessageFieldValue(e.target.value)}
            value={messageFieldValue}
            onKeyPress={e => (e.key === 'Enter' ? onSendMessage() : null)}
          />
          <Fab color="primary" aria-label="add" onClick={onSendMessage} size="small" style={{ marginLeft: 20 }}>
            <SendIcon style={{ fontSize: 18 }} className="material-icons" />
          </Fab>
        </InputPanel>
      </ChatPanel>
    </Box>
  );
}
