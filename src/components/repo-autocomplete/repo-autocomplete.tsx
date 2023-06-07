import {
  ANNOTATION_LOCATION,
  ANNOTATION_ORIGIN_LOCATION,
  Entity,
} from "@backstage/catalog-model";
import { TextField } from "@material-ui/core";
import { Autocomplete } from "@material-ui/lab";
import { Octokit } from "@octokit/rest";
import { useEffect, useState } from "react";

export function ReposAutocomplete({
  token,
  handleRepoSelected,
  githubApiBaseUrl,
  repos,
}) {
  const repoSuggestions: string[] = repos
    .filter((item) => !!item)
    .map((item: { full_name: string }) => item.full_name);

  return (
    <div style={{ marginBlock: 16 }}>
      <Autocomplete
        onChange={handleRepoSelected}
        disablePortal
        id="combo-box-demo"
        options={repoSuggestions}
        renderInput={(params) => <TextField {...params} label="Pick repo" />}
      />
    </div>
  );
}
