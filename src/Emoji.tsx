import { motion, Variants } from "framer-motion";
import React, { memo } from "react";
import styled from "styled-components";
import { BaseProps } from "./baseTypes";
import { useEmoji } from "./redux/selectors";

const variants: Variants = {
  init: {
    transform: "scale(0)",
  },
  active: {
    transform: "scale(1)",
  },
  exit: {
    opacity: 0,
  },
};

interface Props extends BaseProps {
  id: string;
}

function EmojiUnstyled({ id, style, ...otherProps }: Props) {
  const data = useEmoji(id);

  if (!data) {
    return null;
  }

  return (
    <div
      {...otherProps}
      style={{ ...style, left: `${data.x}px`, top: `${data.y}px` }}
      title={`My id is ${id}`}
    >
      <motion.div
        initial="init"
        animate="active"
        exit="exit"
        variants={variants}
        transition={{ type: "spring", bounce: 0.6 }}
      >
        <span>{data.emoji}</span>
      </motion.div>
    </div>
  );
}

export default styled(memo(EmojiUnstyled))`
  user-select: none;
  transform: translate(-50%, -50%);
  font-size: 3rem;
`;
