import { Routes, Route } from "react-router";

import Home from "./pages/Home";
import AuthenticationApp from "./pages/AuthenticationApp";
import YouTubeVideosListing from "./pages/YouTubeVideosListing";
import ProductListing from "./pages/ProductListing";
import QuotesListing from "./pages/QuotesListing";
import JokesViewer from "./pages/JokesViewer";
import RandomCatViewer from "./pages/RandomCatViewer";
import MealsListing from "./pages/MealsListing";
import RandomUsers from "./pages/RandomUsers";

export default function App() {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/authentication-app" element={<AuthenticationApp />} />
            <Route
                path="/youtube-videos-listing"
                element={<YouTubeVideosListing />}
            />
            <Route path="/product-listing" element={<ProductListing />} />
            <Route path="/quotes-listing" element={<QuotesListing />} />
            <Route path="/jokes-viewer" element={<JokesViewer />} />
            <Route path="/random-cat-viewer" element={<RandomCatViewer />} />
            <Route path="/meals-listing" element={<MealsListing />} />
            <Route path="/random-users" element={<RandomUsers />} />
        </Routes>
    );
}
