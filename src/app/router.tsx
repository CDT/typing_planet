import { createBrowserRouter, Navigate } from "react-router-dom";
import { Shell } from "./Shell";
import { MapPage } from "@/pages/map/MapPage";
import { PlanetPage } from "@/pages/planet/PlanetPage";
import { LessonPage } from "@/pages/lesson/LessonPage";
import { ResultPage } from "@/pages/lesson/ResultPage";
import { MePage } from "@/pages/me/MePage";
import { SettingsPage } from "@/pages/settings/SettingsPage";
import { AboutPage } from "@/pages/about/AboutPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Shell />,
    children: [
      { index: true, element: <Navigate to="/map" replace /> },
      { path: "map", element: <MapPage /> },
      { path: "planet/:id", element: <PlanetPage /> },
      { path: "me", element: <MePage /> },
      { path: "settings", element: <SettingsPage /> },
      { path: "about", element: <AboutPage /> },
    ],
  },
  { path: "/lesson/:id", element: <LessonPage /> },
  { path: "/lesson/:id/result", element: <ResultPage /> },
]);
