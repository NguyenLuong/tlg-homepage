"use client";

import dynamic from "next/dynamic";

import { NewsEditorSkeleton } from "@/components/ui/news-editor-skeleton";

const NewsEditorForm = dynamic(() => import("./news-editor-form"), {
  ssr: false,
  loading: () => <NewsEditorSkeleton />,
});

export default NewsEditorForm;
