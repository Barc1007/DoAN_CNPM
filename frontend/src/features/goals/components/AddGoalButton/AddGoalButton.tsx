import React from "react";
import { Plus } from "lucide-react";
import styles from "./AddGoalButton.module.css";

interface AddGoalButtonProps {
  onClick?: () => void;
}

const AddGoalButton: React.FC<AddGoalButtonProps> = ({ onClick }) => {
  return (
    <button className={styles.button} type="button" onClick={onClick}>
      <Plus size={20} />
      <span>Thêm mục tiêu mới</span>
    </button>
  );
};

export default AddGoalButton;
