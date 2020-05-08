import styled, { StyledFunction } from 'styled-components';

const outerWrapper: StyledFunction<React.ComponentType<any>> = styled.div;
export const OuterWrapper = outerWrapper`
position: relative;
width: 100%;
height: 0;
/**
 * For human readability, the ratio is expressed as
 * width / height, so we need to invert it.
 */
padding-bottom: ${(props: any) => (1 / props.ratio) * 100}%;
`;
export const InnerWrapper = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
`;
