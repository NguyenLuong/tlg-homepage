"use client";

import dynamic from "next/dynamic";

import { JobEditorSkeleton } from "@/components/ui/job-editor-skeleton";

const JobEditorForm = dynamic(() => import("./job-editor-form"), {
  ssr: false,
  loading: () => <JobEditorSkeleton />,
});

export default JobEditorForm;
