import React from "react";

const CategoryForm = ({ handleSubmit, value, setValue }) => {
  const onSubmit = (e) => {
    e.preventDefault();
    if (!value.trim()) return;
    handleSubmit(e);
  };

  return (
    <>
      <form onSubmit={onSubmit} data-testid="category-form">
        <div className="mb-3">
          <input
            type="text"
            className="form-control"
            placeholder="Enter new category"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        </div>

        <button type="submit" className="btn btn-primary">
          Submit
        </button>
      </form>
    </>
  );
};

export default CategoryForm;
