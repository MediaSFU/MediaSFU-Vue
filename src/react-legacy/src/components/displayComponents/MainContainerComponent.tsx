import React, { useEffect, useState } from "react";

export interface MainContainerComponentOptions {
  backgroundColor?: string;
  children: React.ReactNode;
  containerWidthFraction?: number;
  containerHeightFraction?: number;
  marginLeft?: number;
  marginRight?: number;
  marginTop?: number;
  marginBottom?: number;
  padding?: number;
}

export type MainContainerComponentType = (
  options: MainContainerComponentOptions
) => React.JSX.Element;

/**
 * MainContainerComponent is a React functional component that renders a container
 * with customizable dimensions and margins. The container's dimensions adapt to the window size
 * based on provided width and height fractions, and it updates dynamically on window resize
 * or orientation changes.
 *
 * @component
 * @param {MainContainerComponentOptions} props - The properties for MainContainerComponent.
 * @param {string} [props.backgroundColor='transparent'] - Background color of the container.
 * @param {React.ReactNode} props.children - Child elements to render inside the container.
 * @param {number} [props.containerWidthFraction=1] - Fraction of window width for container's width.
 * @param {number} [props.containerHeightFraction=1] - Fraction of window height for container's height.
 * @param {number} [props.marginLeft=0] - Left margin of the container.
 * @param {number} [props.marginRight=0] - Right margin of the container.
 * @param {number} [props.marginTop=0] - Top margin of the container.
 * @param {number} [props.marginBottom=0] - Bottom margin of the container.
 * @param {number} [props.padding=0] - Padding inside the container.
 *
 * @returns {React.JSX.Element} The rendered container component.
 * 
 * @example
 * ```tsx
 * import React from 'react';
 * import { MainContainerComponent } from 'mediasfu-reactjs';
 *
 * function App() {
 *   return (
 *     <MainContainerComponent
 *       backgroundColor="black"
 *       containerWidthFraction={0.5}
 *       containerHeightFraction={0.5}
 *       marginLeft={10}
 *       marginRight={10}
 *       marginTop={10}
 *       marginBottom={10}
 *       padding={10}
 *     >
 *       <ChildComponent />
 *     </MainContainerComponent>
 *   );
 * }
 *
 * export default App;
 * ```
 */

const MainContainerComponent: React.FC<MainContainerComponentOptions> = ({
  backgroundColor = "transparent",
  children,
  containerWidthFraction = 1,
  containerHeightFraction = 1,
  marginLeft = 0,
  marginRight = 0,
  marginTop = 0,
  marginBottom = 0,
  padding = 0,
}) => {
  // State to store calculated aspect styles
  const [aspectStyles, setAspectStyles] = useState({
    height: Math.floor(containerHeightFraction * window.innerHeight),
    width: Math.floor(containerWidthFraction * window.innerWidth),
    maxHeight: Math.floor(containerHeightFraction * window.innerHeight),
    maxWidth: Math.floor(containerWidthFraction * window.innerWidth),
  });

  // Effect to update aspect styles on dimension changes
  useEffect(() => {
    const updateAspectStyles = () => {
      const windowHeight = window.innerHeight;
      const windowWidth = window.innerWidth;

      setAspectStyles({
        height: Math.floor(containerHeightFraction * windowHeight),
        width: Math.floor(containerWidthFraction * windowWidth),
        maxHeight: Math.floor(containerHeightFraction * windowHeight),
        maxWidth: Math.floor(containerWidthFraction * windowWidth),

      });

    };

    // Initial setup
    updateAspectStyles();

    // Listen for resize events
    window.addEventListener("resize", updateAspectStyles);
    window.addEventListener("orientationchange", updateAspectStyles);

    return () => {
      // Remove event listeners for dimension changes
      window.removeEventListener("resize", updateAspectStyles);
      window.removeEventListener("orientationchange", updateAspectStyles);
    };
  }, []);

  return (
    <div
      style={{
        backgroundColor,
        marginLeft,
        marginRight,
        marginTop,
        marginBottom,
        padding,
        overflow: "hidden",
        ...aspectStyles,
      }}
    >
      {children}
    </div>
  );
};

export default MainContainerComponent;
