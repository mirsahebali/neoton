import { AxiosError } from "axios";
import { instance } from "../requests"
import { createSignal } from "solid-js";

export default function TestPage() {
  let [error, setError] = createSignal<AxiosError | undefined>()
  let [res, setRes] = createSignal<any>()
  async function getHealth() {
    try {
      const res = await instance.get("/api/health");

      setRes(res.data)
    } catch (e: any) {
      const err: AxiosError = e
      setError(err)
      console.log(err);


    }

  }
  return <div>
    <h1> Test Page</h1>
    <button class="btn btn-error" onClick={getHealth}>Test Health</button>
    <div>
      <div> ERROR: {error()?.toString()}</div>
      <div> OK: {JSON.stringify(res())}</div>
    </div>
  </div>
}
