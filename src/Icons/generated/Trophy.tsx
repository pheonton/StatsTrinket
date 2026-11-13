import PropTypes from 'prop-types';
import { SVGProps } from 'react';
interface SVGRProps {
  title?: string;
  titleId?: string;
  size?: string;
}
const Trophy = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      height={props.size || 16}
      width={props.size || 16}
      aria-labelledby={titleId}
      {...props}
    >
      {title ? <title id={titleId}>{title}</title> : null}
      <path
        fill="currentColor"
        d="M136 64v32H80c-9 0-16 7-16 16v32c0 58 42 98 98 104l.59-1.557c-7.888-10.913-14.192-23.214-18.69-36.632C119.34 197.115 104 173.58 104 144v-16h32v32c0 17.831 2.783 34.543 7.9 49.81-22.99-3.953 8.193 25.263 18.69 36.633 17.447 24.14 42.55 41.531 72.451 49.557H232v72h-56c-9 0-16 7-16 16v32h-32v32h256v-32h-32v-32c0-9-7-16-16-16h-56v-72h-3.041c29.901-8.026 55.004-25.417 72.451-49.557L350 248c56-6 98-46 98-104v-32c0-9-7-16-16-16h-56V64Zm240 64h32v16c0 29.581-15.34 53.115-39.9 65.81 5.117-15.267 7.9-31.979 7.9-49.81Z"
      />
    </svg>
  );
};
Trophy.propTypes = {
  title: PropTypes.string,
};
export default Trophy;
