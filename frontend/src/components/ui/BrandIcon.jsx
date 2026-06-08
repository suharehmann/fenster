import { BorderOuterOutlined } from '@ant-design/icons';

export default function BrandIcon({ className = '', size }) {
  const style = size ? { fontSize: size } : undefined;

  return <BorderOuterOutlined className={className} style={style} aria-hidden />;
}
