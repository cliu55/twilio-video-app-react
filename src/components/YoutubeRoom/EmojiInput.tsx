import 'emoji-mart/css/emoji-mart.css';
import styled from 'styled-components/macro';

import InsertEmoticonIcon from '@material-ui/icons/InsertEmoticon';

import React, { useState, useCallback, useRef } from 'react';
import useClickOutside from '../../hooks/useClickOutside';
import { Picker, EmojiData } from 'emoji-mart';

const Dialog = styled.div`
  position: absolute;
  bottom: 0;
  right: 0;
`;

const EmojiButton = styled.span`
  cursor: pointer;
  padding: 5px;
`;

interface EmojiInputProps {
  value: string;
  onSelection(contentWithEmoji: string): any;
}

export default function EmojiInput({ value, onSelection }: EmojiInputProps) {
  const [showPicker, setPickerState] = useState(false);
  const picker = useRef<HTMLDivElement>(null);

  const dismissPicker = useCallback(() => {
    setPickerState(false);
  }, [setPickerState]);

  useClickOutside([picker], dismissPicker);

  const togglePicker = () => {
    setPickerState(!showPicker);
  };

  const addEmoji = (emoji: EmojiData) => {
    if ('native' in emoji) {
      onSelection(`${value}${emoji.native}`);
      dismissPicker();
    }
  };

  return (
    <div ref={picker}>
      <Dialog>{showPicker && <Picker emoji="" title="" native={true} onSelect={addEmoji} />}</Dialog>
      <EmojiButton onClick={togglePicker}>
        <InsertEmoticonIcon style={{ fontSize: 35 }} />
      </EmojiButton>
    </div>
  );
}

export { EmojiInput };
