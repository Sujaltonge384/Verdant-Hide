// client/src/app/shop/page.tsx
import { redirect } from 'next/navigation';
export default function ShopRedirect() {
  redirect('/collection');
}