import * as React from 'react';
import * as Styles from './AspectRatio.styles';
interface Props {
  children?: any;
  /**
   * The width divided by the height. This ratio can be passed in
   * using JavaScript division syntax. So, to get a 16:9 ratio,
   * simply pass `ratio={16/9}`.
   */
  ratio: number;
}
const AspectRatio = ({ children, ratio }: Props) => (
  <Styles.OuterWrapper ratio={ratio}>
    <Styles.InnerWrapper>{children}</Styles.InnerWrapper>
  </Styles.OuterWrapper>
);
export default AspectRatio;
