import React from 'react';
import TextField from '@material-ui/core/TextField';

export default function TextInput({ textfield, messageFieldValue, setMessageFieldValue, onSendMessage }) {
  const handleKeyPress = e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onSendMessage();
    }
  };

  return (
    <TextField
      inputRef={textfield}
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
      onKeyPress={handleKeyPress}
    />
  );
}
