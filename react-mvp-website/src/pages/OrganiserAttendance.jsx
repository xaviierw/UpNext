import { useEffect, useMemo, useState } from "react"
import { useParams } from "react-router"
import { useNavigate } from "react-router"
import { Container, Card, Table, Badge, Spinner, Alert, Button, Form } from "react-bootstrap"
import NavBarOrg from "../components/NavBarOrg"

const BACKEND_URL = import.meta.env.VITE_API_URL || "https://api.upnextt.xyz";

const formatDateTime = (date) => {
  if (!date) return "—"
  return new Date(date).toLocaleString("en-SG", { timeZone: "Asia/Singapore", day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true,})
}

const statusBadge = (status) => {
  if (status === 1) return <Badge bg="success">Attended</Badge>
  if (status === 2) return <Badge bg="danger">Cancelled</Badge>
  return <Badge bg="secondary">Registered</Badge>
}

const OrganiserAttendance = () => {
  const { eventId } = useParams()
  const navigate = useNavigate()
  const [event, setEvent] = useState(null)
  const [attendance, setAttendance] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [selectedIds, setSelectedIds] = useState([])
  const [saving, setSaving] = useState(false)
  const [successMsg, setSuccessMsg] = useState("")

  const fetchAttendance = async () => {
    try {
      setLoading(true)
      setError("")
      setSuccessMsg("")
      setSelectedIds([])

      const token = localStorage.getItem("token")
      const res = await fetch(`${BACKEND_URL}/api/organiser/events/${eventId}/attendance`,{ 
        headers: { Authorization: `Bearer ${token}` } }
      )

      const data = await res.json()
      if (!res.ok) {
        setError(data?.message || "Failed to load attendance.")
        return
      }

      setEvent(data.event)
      setAttendance(data.attendance || [])
    } catch (err) {
      console.error(err)
      setError("Something went wrong while fetching attendance.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAttendance()
  }, [eventId])

  const filteredAttendance = useMemo(() => {
    if (filterStatus === "all") return attendance
    return attendance.filter((a) => a.status === Number(filterStatus))
  }, [attendance, filterStatus])

  const toggleOne = (registrationId) => {
    setSelectedIds((prev) => {
      if (prev.includes(registrationId)) return prev.filter((id) => id !== registrationId)
      return [...prev, registrationId]
    })
  }

  const toggleAllVisible = () => {
    const selectableVisibleIds = filteredAttendance
      .filter((a) => a.status !== 1 && a.status !== 2)
      .map((a) => a.registrationId)

    const allSelected = selectableVisibleIds.every((id) => selectedIds.includes(id))
    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !selectableVisibleIds.includes(id)))
      return
    }

    setSelectedIds((prev) => {
      const set = new Set(prev)
      selectableVisibleIds.forEach((id) => set.add(id))
      return Array.from(set)
    })
  }

  const markPresent = async () => {
    try {
      setSaving(true)
      setError("")
      setSuccessMsg("")

      const token = localStorage.getItem("token")
      const res = await fetch(`${BACKEND_URL}/api/organiser/events/${eventId}/attendance/mark-present`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ registrationIds: selectedIds }),
        }
      )

      const data = await res.json()
      if (!res.ok) {
        setError(data?.message || "Failed to mark present.")
        return
      }

      setSuccessMsg(`Marked present: ${data.modifiedCount || 0}`)
      await fetchAttendance()
    } catch (err) {
      console.error(err)
      setError("Something went wrong while saving attendance.")
    } finally {
      setSaving(false)
    }
  }

  const selectableCount = filteredAttendance.filter((a) => a.status !== 1 && a.status !== 2).length
  const allVisibleSelected = selectableCount > 0 && filteredAttendance
      .filter((a) => a.status !== 1 && a.status !== 2)
      .every((a) => selectedIds.includes(a.registrationId))

  return (
    <div>
      <NavBarOrg />
      <div style={{ height: "85px" }} />

      <Container>
        <div className="d-flex align-items-center justify-content-between mb-3">
          <h3 className="mb-0">Attendance Sheet</h3>
          <Button variant="outline-secondary" size="sm" onClick={() => navigate(-1)}>Back</Button>
        </div>

        {loading && (
          <div className="text-center py-5">
            <Spinner animation="border" role="status" />
            <div className="mt-2">Loading attendance</div>
          </div>
        )}

        {!loading && error && <Alert variant="danger">{error}</Alert>}
        {!loading && successMsg && <Alert variant="success">{successMsg}</Alert>}

        {!loading && !error && (
          <Card className="shadow-sm border-0" style={{ borderRadius: "12px" }}>
            <Card.Body>
              {event && (
                <div className="mb-3">
                  <h5 className="mb-1">{event.title}</h5>
                  <div className="text-muted small">
                    {formatDateTime(event.startDateTime)} – {formatDateTime(event.endDateTime)} ·{" "}
                    {event.location || "No location"}
                  </div>
                </div>
              )}

              <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="text-muted">
                  Showing: {filteredAttendance.length} / {attendance.length}
                </div>

                <div className="d-flex gap-2 align-items-center">
                  <select
                    className="form-select form-select-sm"
                    style={{ width: "200px" }}
                    value={filterStatus}
                    onChange={(e) => {
                      setFilterStatus(e.target.value)
                      setSelectedIds([])
                      setSuccessMsg("")
                    }}
                  >
                    <option value="all">All</option>
                    <option value="0">Registered</option>
                    <option value="1">Attended</option>
                    <option value="2">Cancelled</option>
                  </select>

                  <Button variant="primary" size="sm" disabled={selectedIds.length === 0 || saving} onClick={markPresent}>{saving ? "Saving..." : `Mark Present (${selectedIds.length})`}</Button>
                </div>
              </div>

              {filteredAttendance.length === 0 ? (
                <Alert variant="info" className="mb-0">No attendees for the selected filter.</Alert>
              ) : (
                <Table responsive hover className="mb-0 align-middle">
                  <thead>
                    <tr>
                      <th style={{ width: "6%" }}>
                        <Form.Check type="checkbox" checked={allVisibleSelected} disabled={selectableCount === 0} onChange={toggleAllVisible}/>
                      </th>
                      <th style={{ width: "26%" }}>Name</th>
                      <th style={{ width: "28%" }}>Email</th>
                      <th style={{ width: "14%" }}>Status</th>
                      <th style={{ width: "20%" }}>Registered</th>
                      <th style={{ width: "10%" }}>Reminders</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAttendance.map((a) => {
                      const disabled = a.status === 1 || a.status === 2
                      const checked = selectedIds.includes(a.registrationId)

                      return (
                        <tr key={a.registrationId}>
                          <td>
                            <Form.Check type="checkbox" checked={checked} disabled={disabled} onChange={() => toggleOne(a.registrationId)}/>
                          </td>
                          <td>{a.name}</td>
                          <td>{a.email}</td>
                          <td>{statusBadge(a.status)}</td>
                          <td>{formatDateTime(a.registeredAt)}</td>
                          <td>
                            <div className="small">
                              {a.wantsEmailReminder ? "Email" : ""}
                              {a.wantsEmailReminder && a.wantsInAppReminder ? ", " : ""}
                              {a.wantsInAppReminder ? "In-app" : ""}
                              {!a.wantsEmailReminder && !a.wantsInAppReminder ? "—" : ""}
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </Table>
              )}

              <div className="text-muted small mt-3">Note: Only <strong>Registered</strong> attendees can be marked present. Cancelled / Attended are disabled.</div>
            </Card.Body>
          </Card>
        )}
      </Container>
    </div>
  )
}

export default OrganiserAttendance