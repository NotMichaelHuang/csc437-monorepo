import { Header } from "./Header.tsx";
import { Outlet } from 'react-router-dom';

export function MainLayout() {
    return (
        <div>
            <Header />
            <div style={{padding: "0 2em"}}>
                < Outlet />
            </div>
        </div>
    );
}
