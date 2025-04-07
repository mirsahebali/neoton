import { useGetUser } from "../contexts";

export default function Settings() {
  const { currentUser } = useGetUser();
  return (
    <div class="flex items-center justify-center gap-6 mt-10 ">
      <div class="card p-10 bg-base-300">
        <ul class="list bg-base-300 rounded-box shadow-md gap-10">
          <li class="list-item btn w-full btn-info text-center ">
            Username: @{currentUser.username}
          </li>
          <li class="list-item btn w-full btn-info text-center">
            Email: @{currentUser.email}
          </li>
        </ul>
      </div>
    </div>
  );
}
