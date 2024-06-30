import DashboardLayout from "../../layouts/DashboardLayout";
import { PlusIcon } from "../../assets";

const Home = () => {
  return (
    <DashboardLayout>
      <div className="flex flex-col w-full bg-white py-11 ">
        <div className="flex items-center justify-between px-10 ">
          <p className="text-xl font-medium text-rpmary">List of admins</p>
          <button className="bg-warning flex items-center justify-center space-x-2 py-[14px] px-5 rounded-[4px] ">
            <PlusIcon />
            <span className="text-sm font-bold text-secondary">
              Add new Admin
            </span>
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Home;
