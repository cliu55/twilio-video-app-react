import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';

import Box from '@material-ui/core/Box';
import Fab from '@material-ui/core/Fab';
import SendIcon from '@material-ui/icons/Send';
import Divider from '@material-ui/core/Divider';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Typography from '@material-ui/core/Typography';
import Avatar from '@material-ui/core/Avatar';

import TextInput from './TextInput';
import EmojiInput from './EmojiInput';
import GIFInput from './GIFInput';
import { useAppState } from '../../state';
import { useYoutubeRoomState } from '../YoutubeRoomStateProvider';

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

const Scrollable = styled.div`
  max-height: 65vh;
  overflow: auto;
`;

export default function ChatWindow() {
  const {
    roomId: { current: roomId },
  } = useAppState();
  const { client } = useYoutubeRoomState();
  const panel = useRef(null);
  const textfield = useRef(null);

  const [chatHistory, setChatHistory] = useState([]);
  const [messageFieldValue, setMessageFieldValue] = useState('');

  useEffect(() => {
    client.registerHandler('message', onMessageReceived);
  }, [client]);

  useEffect(() => {
    scrollChatToBottom();
  }, [chatHistory]);

  const onMessageReceived = entry => {
    console.log('msg received', entry);
    setChatHistory(prev => prev.concat(entry));
  };

  const onSendMessage = () => {
    if (messageFieldValue.trim().length === 0) return;
    client.message(roomId, messageFieldValue, 'text');
    setMessageFieldValue('');
  };

  const scrollChatToBottom = () => {
    panel.current.scrollTop = panel.current.scrollHeight;
  };

  const emojiInserted = messageWithEmoji => {
    setMessageFieldValue(messageWithEmoji);
    textfield.current.focus();
  };

  const onSenGif = url => {
    client.message(roomId, url, 'gif');
  };

  return (
    <Box m={1} height="73vh">
      <ChatPanel>
        <Scrollable ref={panel}>
          <List>
            {chatHistory.map(({ user, message, event, type }, i) => {
              return [
                <NoDots>
                  <ListItem key={i} style={{ color: '#fafafa' }}>
                    <ListItemAvatar>
                      <Avatar src={user.photoURL} />
                    </ListItemAvatar>
                    <ListItemText
                      primary={`${user.name} ${event || ''}`}
                      secondary={
                        <React.Fragment>
                          {type === 'gif' ? (
                            <img src={message} alt="" width="60%" height="60%" />
                          ) : (
                            <Typography component="span" variant="body2" color="textPrimary">
                              {message}
                            </Typography>
                          )}
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
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" flexDirection="column" width={1 / 10}>
            <EmojiInput value={messageFieldValue} onSelection={emojiInserted} />
            <GIFInput onSelection={onSenGif} />
          </Box>
          <Box width={9 / 10} display="flex" alignItems="center" p={1}>
            <TextInput
              textfield={textfield}
              messageFieldValue={messageFieldValue}
              setMessageFieldValue={setMessageFieldValue}
              onSendMessage={onSendMessage}
            />
            <Fab color="primary" aria-label="add" onClick={onSendMessage} size="small">
              <SendIcon style={{ fontSize: 18 }} />
            </Fab>
          </Box>
        </Box>
      </ChatPanel>
    </Box>
  );
}
