// https://github.com/yannickcr/eslint-plugin-react/issues/3140
/* eslint react/prop-types: "off" */
import React, { forwardRef, StyleHTMLAttributes, useEffect } from 'react';
import cx from 'clsx';

import { Toast } from './Toast';
import { CloseButton } from './CloseButton';
import { Bounce } from './Transitions';
import { Direction, Default, parseClassName, isFn } from '../utils';
import { useToastContainer } from '../hooks/useToastContainer';
import {
  Toast as ToastType,
  ToastContainerProps,
  ToastPosition
} from '../types';

export const ToastContainer = forwardRef<HTMLDivElement, ToastContainerProps>(
  (props, ref) => {
    const { getToastToRender, containerRef, isToastActive } =
      useToastContainer(props);
    const { className, style, rtl, containerId } = props;

    function getClassName(position: ToastPosition) {
      const defaultClassName = cx(
        `${Default.CSS_NAMESPACE}__toast-container`,
        `${Default.CSS_NAMESPACE}__toast-container--${position}`,
        { [`${Default.CSS_NAMESPACE}__toast-container--rtl`]: rtl }
      );
      return isFn(className)
        ? className({
            position,
            rtl,
            defaultClassName
          })
        : cx(defaultClassName, parseClassName(className));
    }

    useEffect(() => {
      if (ref) {
        (ref as React.MutableRefObject<HTMLDivElement>).current =
          containerRef.current!;
      }
    }, []);

    return (
      <div
        ref={containerRef}
        className={Default.CSS_NAMESPACE as string}
        id={containerId as string}
      >
        {getToastToRender((position, toastList) => {
          const containerStyle: React.CSSProperties = !toastList.length
            ? { ...style, pointerEvents: 'none' }
            : { ...style };

          console.log('toastList: ', toastList);
          return (
            <div
              className={getClassName(position)}
              style={containerStyle}
              key={`container-${position}`}
            >
              {toastList
                .sort((a, b) => sortToastByOrder(a, b, position))
                .map(({ content, props: toastProps }, i) => {
                  console.log('toastProps: ', toastProps);
                  return (
                    <Toast
                      {...toastProps}
                      isIn={isToastActive(toastProps.toastId)}
                      style={
                        {
                          ...toastProps.style,
                          '--nth': i + 1,
                          '--len': toastList.length
                        } as StyleHTMLAttributes<HTMLDivElement>
                      }
                      key={`toast-${toastProps.key}`}
                    >
                      {content}
                    </Toast>
                  );
                })}
            </div>
          );
        })}
      </div>
    );
  }
);

function sortToastByOrder(a: ToastType, b: ToastType, position: ToastPosition) {
  // Check if either "order" property is undefined
  if (a.props.order === undefined && b.props.order === undefined) {
    return 0;
  } else if (a.props.order === undefined) {
    return 1; // "a" has undefined "order", move it to the end
  } else if (b.props.order === undefined) {
    return -1; // "b" has undefined "order", move it to the end
  } else {
    // For consistency,
    // If the container position is top the toast with least order will be at top
    // If the container position is bottom the toast with least order will be at bottom
    return position.includes('top')
      ? a.props.order - b.props.order
      : b.props.order - a.props.order; // Compare "order" property if both are defined
  }
}

ToastContainer.displayName = 'ToastContainer';

ToastContainer.defaultProps = {
  position: 'top-right',
  transition: Bounce,
  autoClose: 5000,
  closeButton: CloseButton,
  pauseOnHover: true,
  pauseOnFocusLoss: true,
  closeOnClick: true,
  draggable: true,
  draggablePercent: Default.DRAGGABLE_PERCENT as number,
  draggableDirection: Direction.X,
  role: 'alert',
  theme: 'light'
};
