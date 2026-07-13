import { getDB } from "../config/db";
import { Collection } from "mongodb";

export function opportunitiesCollection(): Collection {
  return getDB().collection("opportunities");
}

export function applicationsCollection(): Collection {
  return getDB().collection("applications");
}

export function categoriesCollection(): Collection {
  return getDB().collection("categories");
}

export function organizationsCollection(): Collection {
  return getDB().collection("organizations");
}

export function contactMessagesCollection(): Collection {
  return getDB().collection("contactMessages");
}
