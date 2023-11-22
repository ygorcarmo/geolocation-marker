"use client";

import { convertAddress } from "@/utlis/actions";
import { useFormState } from "react-dom";
import { Loader } from "@googlemaps/js-api-loader";
import { useEffect, useState } from "react";
import SubmitButton from "@/components/SubmitButton";

const initialState = {
  message: "",
  data: undefined,
};

export default function Home() {
  const [state, formAction] = useFormState(convertAddress, initialState);
  const [map, setMap] = useState(null);
  const loader = new Loader({
    apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    version: "weekly",
  });
  useEffect(() => {
    async function initMap() {
      // Request needed libraries.
      const { Map } = await loader.importLibrary("maps");
      let initMap = new Map(document.getElementById("map") as HTMLElement, {
        center: { lat: -33.8622796, lng: 151.1167284 },
        zoom: 10,
        mapId: process.env.NEXT_PUBLIC_MAP_ID,
      });
      setMap(initMap);
    }
    initMap();
  }, []);

  async function createNewMaker(map, data?) {
    const { AdvancedMarkerElement, PinElement } = await loader.importLibrary(
      "marker"
    );
    const { InfoWindow } = await loader.importLibrary("maps");
    const infoWindow = new InfoWindow();

    const pinBackground = new PinElement({
      background: data.colour,
    });
    const marker = new AdvancedMarkerElement({
      map,
      position: {
        lat: data.latAndLng.lat,
        lng: data.latAndLng.lng,
      },
      title: data.label,
      content: pinBackground.element,
    });
    // Add a click listener for each marker, and set up the info window.
    marker.addListener("click", ({ domEvent, latLng }) => {
      const { target } = domEvent;
      infoWindow.close();
      infoWindow.setContent(marker.title);
      infoWindow.open(marker.map, marker);
    });
  }
  if (state) {
    if (state.data) {
      console.log(state.data);
      state.data.forEach((element) => {
        createNewMaker(map, element);
      });
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <form
        action={formAction}
        className="border border-gray-500 p-5 rounded-md w-auto"
      >
        <input type="file" id="fileUpload" name="file" accept=".xls,.xlsx" />
        <SubmitButton />
      </form>
      <div id="map" className="h-[60vh] w-[70vw]"></div>
    </main>
  );
}
