import "../styles/Pagination.css";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
const startPage = Math.max(1, Math.min(currentPage - 1, totalPages - 2));
const endPage = Math.min(totalPages, startPage + 2);

  const pages = Array.from(
    { length: endPage - startPage + 1 }, 
    (_, i) => startPage + i);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  return (<div className="pagination">
    <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
      {'\u00AB'}
    </button>
    {pages.map(page => (
      <button
        key={page}
        onClick={() => handlePageChange(page)}
        className={page === currentPage ? "page-active" : ""}
      >
        {page}
      </button>
    ))}
    <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
      {'\u00BB'}
    </button>
  </div>);
}

export default Pagination;