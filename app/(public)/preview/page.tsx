// preview page for newly created UI components
import SkeletonCard from "@/components/SkeletonCard"
import Avatar from "@/components/Avatar"

export default function PreviewPage() {
  return (
    <div className="page-content">
      <h2>Preview</h2>
      <div className="preview-grid">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>

      <h2>Avatar</h2>
      <div style={{ display: "flex", gap: "1rem", alignItems: "center", marginTop: "1rem" }}>
        <Avatar name="alice" />
        <Avatar name="JohnDoe" />
        <Avatar name="MasterThief" />
        <Avatar name="PocketHeist" />
      </div>
    </div>
  )
}
