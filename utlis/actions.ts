"use server";

import { read, utils } from "xlsx";
import { Client } from "@googlemaps/google-maps-services-js";

const convertAddressToLatLong = async (
  addresses: [{ address: string; department: string; colour: string }]
) => {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  const latLngAndDep = [];

  const mapsClient = new Client({});
  for (let i = 0; i < addresses.length; i++) {
    const lagAndLng = await mapsClient.geocode({
      params: {
        key: apiKey,
        address: addresses[i].address,
      },
    });

    latLngAndDep.push({
      latAndLng: lagAndLng.data.results[0].geometry.location,
      label: addresses[i].department,
      colour: addresses[i].colour,
    });
  }
  return latLngAndDep;
};

const convertExcelToJSON = async (file: File) => {
  let rowObject: any;
  const data = await file.arrayBuffer();
  let workbook = read(data, {
    type: "binary",
  });
  workbook.SheetNames.forEach((sheet) => {
    rowObject = utils.sheet_to_json(workbook.Sheets[sheet]);
  });
  return rowObject;
};

export async function convertAddress(prevState: any, formData: FormData) {
  try {
    const file = formData.get("file") as File;
    const addressAndDep = await convertExcelToJSON(file);
    const coordinatesAndDep = await convertAddressToLatLong(addressAndDep);
    return { message: "success", data: coordinatesAndDep };
  } catch (e) {
    console.log(e);
    return { message: "error" };
  }
}
