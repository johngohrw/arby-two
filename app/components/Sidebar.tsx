"use client";

import { UseFormRegister, FieldErrors } from "react-hook-form";
import { GitlabConfig } from "@/lib/gitlab-config";

interface SidebarProps {
  register: UseFormRegister<GitlabConfig>;
  errors: FieldErrors<GitlabConfig>;
  isOpen: boolean;
}

export function Sidebar({ register, errors, isOpen }: SidebarProps) {
  const inputClass = (hasError: boolean) =>
    [
      "w-full bg-gray-800 text-gray-200 text-sm rounded px-3 py-2 border focus:outline-none placeholder-gray-600",
      hasError
        ? "border-red-500 focus:border-red-400"
        : "border-gray-700 focus:border-blue-500",
    ].join(" ");

  return (
    <aside
      className={`fixed left-0 top-14 bottom-14 bg-gray-900 border-r border-gray-800 transition-all duration-200 overflow-hidden ${
        isOpen ? "w-64 opacity-100" : "w-0 opacity-0"
      }`}
    >
      <div className="h-full overflow-y-auto p-4">
        <h2 className="text-sm font-medium text-gray-300 mb-4 uppercase tracking-wider">
          GitLab Config
        </h2>

        <div className="space-y-4">
          {/* GitLab Endpoint */}
          <div className="space-y-1.5">
            <label
              htmlFor="endpoint"
              className="block text-xs text-gray-500 uppercase tracking-wider"
            >
              GitLab Endpoint
            </label>
            <input
              id="endpoint"
              type="text"
              placeholder="https://gitlab.com/api/v4"
              {...register("endpoint")}
              className={inputClass(!!errors.endpoint)}
            />
            {errors.endpoint && (
              <p className="text-xs text-red-400">{errors.endpoint.message}</p>
            )}
          </div>

          {/* Project ID */}
          <div className="space-y-1.5">
            <label
              htmlFor="projectId"
              className="block text-xs text-gray-500 uppercase tracking-wider"
            >
              Project ID
            </label>
            <input
              id="projectId"
              type="text"
              placeholder="12345678"
              {...register("projectId")}
              className={inputClass(!!errors.projectId)}
            />
            {errors.projectId && (
              <p className="text-xs text-red-400">{errors.projectId.message}</p>
            )}
          </div>

          {/* ARB Filepaths */}
          <div className="space-y-1.5">
            <label
              htmlFor="arbFilepaths"
              className="block text-xs text-gray-500 uppercase tracking-wider"
            >
              ARB Filepaths
            </label>
            <textarea
              id="arbFilepaths"
              placeholder="lib/l10n/app_en.arb, lib/l10n/app_es.arb"
              rows={3}
              {...register("arbFilepaths")}
              className={`${inputClass(!!errors.arbFilepaths)} resize-none`}
            />
            {errors.arbFilepaths ? (
              <p className="text-xs text-red-400">
                {errors.arbFilepaths.message}
              </p>
            ) : (
              <p className="text-xs text-gray-600">
                Comma-separated file paths
              </p>
            )}
          </div>

          {/* Access Token */}
          <div className="space-y-1.5">
            <label
              htmlFor="accessToken"
              className="block text-xs text-gray-500 uppercase tracking-wider"
            >
              Access Token
            </label>
            <input
              id="accessToken"
              type="password"
              placeholder="glpat-xxxxxxxxxxxx"
              {...register("accessToken")}
              className={inputClass(!!errors.accessToken)}
            />
            {errors.accessToken && (
              <p className="text-xs text-red-400">
                {errors.accessToken.message}
              </p>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
