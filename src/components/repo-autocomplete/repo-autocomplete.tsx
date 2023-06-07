import { TextField } from "@material-ui/core";
import { Autocomplete } from "@material-ui/lab";
import { Octokit } from "@octokit/rest";
import { useEffect, useState } from "react";

export function ReposAutocomplete({ token }) {
  const [repos, setRepos] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const octokit = new Octokit({
        auth: token,
      });

      const response = await octokit.request("GET /users/kneyugn/repos", {
        username: "kneyugn",
        headers: {
          "X-GitHub-Api-Version": "2022-11-28",
        },
      });

      console.log(response.data);
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

  const repoSuggestions: string[] = repos
    .filter((item) => !!item)
    .map((item: { full_name: string }) => item.full_name);

  return (
    <>
      <Autocomplete
        disablePortal
        id="combo-box-demo"
        options={repoSuggestions}
        renderInput={(params) => <TextField {...params} label="Pick repo" />}
      />
    </>
  );
}
