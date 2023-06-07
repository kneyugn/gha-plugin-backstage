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
  updateRepoSelected,
  githubApiBaseUrl,
}) {
  const [repos, setRepos] = useState([]);

  const octokit = new Octokit({
    auth: token,
    baseUrl: githubApiBaseUrl,
  });

  const fetchRepo = async (owner, repoName) => {
    return await octokit.request(`GET /repos/${owner}/${repoName}`, {
      owner: owner,
      repo: repoName,
      headers: {
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      const response = await octokit.request("GET /users/kneyugn/repos", {
        username: "kneyugn",
        headers: {
          "X-GitHub-Api-Version": "2022-11-28",
        },
      });
      const newRepos = response.data
        .filter((item) => item.private === false)
        .map((item) => ({
          full_name: item.full_name,
          description: item.description,
        }));
      setRepos(newRepos);
    };

    fetchData().catch(console.error);
  }, []);

  function handleRepoSelected(e, newValue) {
    const [owner, repoName] = newValue?.split("/") || [null, null];
    fetchRepo(owner, repoName)
      .then((data) => {
        const repoResponse = data.data;
        const entityCreated: Entity = {
          apiVersion: "backstage.io/v1alpha1",
          kind: "Component",
          metadata: {
            name: newValue,
            description: "Component with GitHub actions enabled.",
            annotations: {
              "github.com/project-slug": newValue,
              [ANNOTATION_ORIGIN_LOCATION]: `url:${repoResponse["git_url"]}`,
              [ANNOTATION_LOCATION]: `url:${repoResponse["git_url"]}`,
            },
          },
          spec: {
            type: "service",
            lifecycle: "production",
            owner: "engineering-team",
          },
        } as Entity;
        updateRepoSelected(entityCreated);
      })
      .catch(console.error);
  }

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
